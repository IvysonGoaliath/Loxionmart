"""Regression coverage for the complete mall/merchant flow, isolated from production."""
import os
os.environ["DATABASE_URL"]="sqlite://"
os.environ["SECRET_KEY"]="mall-tests-only"
import base64
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.user import User, UserRole
from app.models.business import Business, BusinessCategory
from app.models.service import Service, ServiceType
from app.models.mall import MediaAsset
from app.routers import catalogue, merchant, saved, media, businesses, bookings, orders, services

class OnlineMallTests(unittest.TestCase):
    def setUp(self):
        self.engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
        event.listen(self.engine,"connect",lambda c,r:c.execute("PRAGMA foreign_keys=ON"))
        Base.metadata.create_all(self.engine)
        self.sessions=sessionmaker(bind=self.engine)
        with self.sessions() as db:
            db.add_all([User(id=i,email=f"user{i}@example.com",full_name=f"User {i}",hashed_password="unused",role=UserRole.ADMIN if i==1 else UserRole.CLIENT) for i in range(1,5)])
            db.flush()
            db.add_all([Business(id=1,name="Local Tech",slug="local-tech",category=BusinessCategory.PHONES_TECH,owner_id=2,is_active=True,approval_status="approved",location="Burgersfort"),Business(id=2,name="Private Shop",slug="private",category=BusinessCategory.FASHION,owner_id=3,is_active=False,approval_status="pending")])
            db.flush()
            db.add_all([Service(id=1,business_id=1,name="Test Phone",price=999,service_type=ServiceType.PRODUCT,image_urls=["https://example.com/phone.jpg"],specifications={"Storage":"128 GB"},stock_quantity=4),Service(id=2,business_id=1,name="Phone Setup",price=100,service_type=ServiceType.BOOKING,duration_minutes=30),Service(id=3,business_id=1,name="Hidden Listing",price=1,service_type=ServiceType.PRODUCT,is_available=False),Service(id=4,business_id=2,name="Private Product",price=2,service_type=ServiceType.PRODUCT),Service(id=5,business_id=1,name="Out of Stock",price=20,service_type=ServiceType.PRODUCT,stock_quantity=0)])
            db.commit()
        app=FastAPI()
        for module in (catalogue,merchant,saved,media,businesses,bookings,orders,services):app.include_router(module.router,prefix="/api")
        def database():
            with self.sessions() as db:yield db
        app.dependency_overrides[get_db]=database
        self.client=TestClient(app)
    def tearDown(self):
        self.client.close();self.engine.dispose()
    def auth(self,i):return {"Authorization":"Bearer "+create_access_token({"sub":str(i)})}
    def test_catalogue_search_filters_sort_and_pagination(self):
        r=self.client.get("/api/catalogue").json()
        self.assertEqual(r["total"],3)
        self.assertEqual({x["id"] for x in r["items"]},{1,2,5})
        self.assertEqual(self.client.get("/api/catalogue?q=128").json()["items"][0]["id"],1)
        self.assertEqual(self.client.get("/api/catalogue?kind=booking").json()["total"],1)
        self.assertEqual(self.client.get("/api/catalogue?kind=product&available=true").json()["total"],1)
        self.assertEqual(self.client.get("/api/catalogue?location=Burgersfort&min_price=500").json()["total"],1)
        self.assertEqual(self.client.get("/api/catalogue?sort=price_asc&page_size=1&page=2").json()["items"][0]["id"],2)
        self.assertEqual(self.client.get("/api/catalogue?q=%25").json()["total"],0)
        self.assertEqual(self.client.get("/api/catalogue?max_price=1&min_price=10").status_code,422)
    def test_directory_is_paginated_and_excludes_pending_shops(self):
        r=self.client.get("/api/catalogue/shops?q=Burgersfort&page_size=1").json()
        self.assertEqual(r["total"],1)
        self.assertEqual(r["items"][0]["name"],"Local Tech")
        self.assertNotIn("services",r["items"][0])
        self.assertEqual(self.client.get("/api/catalogue/shops?category=fashion").json()["total"],0)

    def test_public_data_does_not_leak_pending_or_hidden_listings(self):
        self.assertEqual(self.client.get("/api/catalogue/3").status_code,404)
        self.assertEqual(self.client.get("/api/catalogue/4").status_code,404)
        self.assertEqual(self.client.get("/api/businesses/private").status_code,404)
        self.assertEqual(self.client.get("/api/businesses/2/services/").status_code,404)
        ids={x["id"] for x in self.client.get("/api/businesses/local-tech").json()["services"]}
        self.assertNotIn(3,ids)
    def test_owner_cannot_edit_or_read_other_shop_or_self_approve(self):
        self.assertEqual(self.client.get("/api/merchant/shops/1",headers=self.auth(3)).status_code,404)
        self.assertEqual(self.client.put("/api/merchant/shops/1",headers=self.auth(3),json={"name":"Hacked"}).status_code,404)
        self.assertEqual(self.client.put("/api/merchant/shops/2",headers=self.auth(3),json={"is_active":True}).status_code,422)
        self.assertEqual(self.client.get("/api/merchant/applications",headers=self.auth(2)).status_code,403)
        self.assertEqual(self.client.put("/api/merchant/applications/2",headers=self.auth(3),json={"decision":"approved"}).status_code,403)
        self.assertEqual(self.client.put("/api/merchant/shops/2/items/1",headers=self.auth(3),json={"name":"Not yours"}).status_code,404)
    def test_application_prepare_catalogue_approve_then_public(self):
        body={"name":"Local Crafts","category":"fashion","description":"Handmade local clothing and accessories.","location":"Burgersfort","whatsapp_number":"27712345678","confirms_rights":True}
        r=self.client.post("/api/merchant/shops",json=body,headers=self.auth(4))
        self.assertEqual(r.status_code,201,r.text);shop=r.json()
        self.assertFalse(shop["is_active"]);self.assertEqual(shop["approval_status"],"pending")
        item=self.client.post(f"/api/merchant/shops/{shop['id']}/items",headers=self.auth(4),json={"name":"Cotton shirt","price":120,"service_type":"product","image_urls":["https://example.com/photo.jpg"],"specifications":{"Material":"Cotton"}})
        self.assertEqual(item.status_code,201,item.text)
        self.assertEqual(self.client.get(f"/api/catalogue/{item.json()['id']}").status_code,404)
        r=self.client.put(f"/api/merchant/applications/{shop['id']}",headers=self.auth(1),json={"decision":"approved"})
        self.assertEqual(r.status_code,200,r.text)
        self.assertEqual(self.client.get(f"/api/catalogue/{item.json()['id']}").status_code,200)
    def test_edit_preserves_images_and_can_clear_stock(self):
        r=self.client.put("/api/merchant/shops/1/items/1",headers=self.auth(2),json={"price":1099,"stock_quantity":None})
        self.assertEqual(r.status_code,200,r.text)
        self.assertEqual(r.json()["image_urls"],["https://example.com/phone.jpg"])
        self.assertIsNone(r.json()["stock_quantity"])
        self.assertEqual(self.client.post("/api/merchant/shops/1/items",headers=self.auth(2),json={"name":"Bad image","price":2,"image_urls":["javascript:alert(1)"]}).status_code,422)
        self.assertEqual(self.client.post("/api/merchant/shops/1/items",headers=self.auth(2),json={"name":"Bad price","price":-2}).status_code,422)
    def test_saved_collections_are_persistent_idempotent_and_user_scoped(self):
        body={"kind":"item","target_id":1}
        for _ in range(2):self.assertEqual(self.client.put("/api/saved",headers=self.auth(4),json=body).status_code,201)
        self.client.put("/api/saved",headers=self.auth(4),json={"kind":"shop","target_id":1})
        self.assertEqual(len(self.client.get("/api/saved",headers=self.auth(4)).json()["keys"]),2)
        self.assertEqual(self.client.get("/api/saved",headers=self.auth(3)).json()["keys"],[])
        self.assertEqual(self.client.get("/api/saved").status_code,403)
        self.client.delete("/api/saved/item/1",headers=self.auth(4))
        self.assertEqual(self.client.get("/api/saved",headers=self.auth(4)).json()["keys"],["shop:1"])
        self.assertEqual(self.client.put("/api/saved",headers=self.auth(4),json={"kind":"item","target_id":4}).status_code,404)
    def test_upload_roundtrip_and_access_limits(self):
        photo=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZcAAAAASUVORK5CYII=")
        r=self.client.post("/api/media",headers=self.auth(2),files={"file":("photo.png",photo,"image/png")})
        self.assertEqual(r.status_code,201,r.text)
        fetched=self.client.get(r.json()["url"])
        self.assertEqual(fetched.content,photo)
        self.assertEqual(fetched.headers["x-content-type-options"],"nosniff")
        self.assertEqual(self.client.post("/api/media",headers=self.auth(4),files={"file":("photo.png",photo,"image/png")}).status_code,403)
        self.assertEqual(self.client.post("/api/media",headers=self.auth(2),files={"file":("bad.png",b"<script>alert(1)</script>","image/png")}).status_code,422)
        self.assertEqual(self.client.post("/api/media",headers=self.auth(2),files={"file":("big.png",photo+b"x"*(2*1024*1024),"image/png")}).status_code,413)
    def test_booking_checks_service_ownership_type_and_owner_status_transitions(self):
        for shop_id,service_id in [(2,2),(1,1),(1,3),(1,4)]:
            self.assertEqual(self.client.post("/api/bookings/",headers=self.auth(4),json={"business_id":shop_id,"service_id":service_id}).status_code,404)
        r=self.client.post("/api/bookings/",headers=self.auth(4),json={"business_id":1,"service_id":2,"preferred_date":(datetime.now()+timedelta(days=1)).isoformat()})
        self.assertEqual(r.status_code,201,r.text);bid=r.json()["id"]
        self.assertEqual(self.client.get("/api/merchant/shops/1/bookings",headers=self.auth(3)).status_code,404)
        rows=self.client.get("/api/merchant/shops/1/bookings",headers=self.auth(2)).json()
        self.assertEqual(rows[0]["service_name"],"Phone Setup")
        self.assertEqual(self.client.put(f"/api/merchant/shops/1/bookings/{bid}",headers=self.auth(2),json={"status":"completed"}).status_code,409)
        self.assertEqual(self.client.put(f"/api/merchant/shops/1/bookings/{bid}",headers=self.auth(2),json={"status":"confirmed"}).status_code,200)
        self.assertEqual(self.client.get("/api/bookings/my",headers=self.auth(4)).json()[0]["status"],"confirmed")
    def test_payment_stays_disabled_and_rejects_bad_quantities(self):
        with patch("app.routers.orders.create_payment") as payment:
            r=self.client.post("/api/orders/",headers=self.auth(4),json={"business_id":1,"items":[{"service_id":1,"quantity":1}]})
            self.assertEqual(r.status_code,503);payment.assert_not_called()
        r=self.client.post("/api/orders/",headers=self.auth(4),json={"business_id":1,"items":[{"service_id":1,"quantity":-1}]})
        self.assertEqual(r.status_code,422)

if __name__=="__main__":unittest.main()
