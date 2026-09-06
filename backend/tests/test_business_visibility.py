"""Run from backend: python -m unittest discover -s tests -v."""
import os
import unittest

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-only-business-visibility-key"

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.business import Business, BusinessCategory
from app.models.user import User, UserRole
from app.routers import admin, businesses


class BusinessVisibilityTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(bind=self.engine)
        with self.session_factory() as db:
            db.add_all([
                User(id=1, email="admin@example.com", full_name="Admin", hashed_password="unused", role=UserRole.ADMIN),
                User(id=2, email="client@example.com", full_name="Client", hashed_password="unused", role=UserRole.CLIENT),
                Business(id=1, name="Visible", slug="visible", category=BusinessCategory.OTHER, is_active=True),
                Business(id=2, name="Hidden", slug="hidden", category=BusinessCategory.OTHER, is_active=False),
            ])
            db.commit()

        def test_db():
            with self.session_factory() as db:
                yield db

        app = FastAPI()
        app.include_router(admin.router, prefix="/api")
        app.include_router(businesses.router, prefix="/api")
        app.dependency_overrides[get_db] = test_db
        self.client = TestClient(app)
        self.admin_headers = {"Authorization": "Bearer " + create_access_token({"sub": "1"})}
        self.client_headers = {"Authorization": "Bearer " + create_access_token({"sub": "2"})}

    def tearDown(self):
        self.client.close()
        self.engine.dispose()

    def test_admin_sees_hidden_businesses_but_public_does_not(self):
        response = self.client.get("/api/admin/businesses", headers=self.admin_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual({b["id"] for b in response.json()}, {1, 2})
        self.assertEqual([b["id"] for b in self.client.get("/api/businesses/").json()], [1])
        self.assertEqual(self.client.get("/api/businesses/hidden").status_code, 404)

    def test_client_and_guest_cannot_list_hidden_businesses_or_change_visibility(self):
        for headers in ({}, self.client_headers):
            with self.subTest(headers_present=bool(headers)):
                self.assertEqual(self.client.get("/api/admin/businesses", headers=headers).status_code, 403)
                self.assertEqual(self.client.put("/api/businesses/1", json={"is_active": False}, headers=headers).status_code, 403)

    def test_deactivate_and_reactivate_persist_and_update_public_visibility(self):
        for active in (False, True):
            with self.subTest(active=active):
                result = self.client.put("/api/businesses/1", json={"is_active": active}, headers=self.admin_headers)
                self.assertEqual(result.status_code, 200)
                self.assertEqual(result.json()["is_active"], active)
                admin_list = self.client.get("/api/admin/businesses", headers=self.admin_headers).json()
                self.assertEqual(next(b for b in admin_list if b["id"] == 1)["is_active"], active)
                public_ids = {b["id"] for b in self.client.get("/api/businesses/").json()}
                self.assertEqual(1 in public_ids, active)
                self.assertEqual(self.client.get("/api/businesses/visible").status_code, 200 if active else 404)


if __name__ == "__main__":
    unittest.main()
