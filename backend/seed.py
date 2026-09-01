"""
Run once to create admin user + seed businesses:
  python seed.py
"""
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.business import Business, BusinessCategory
from app.models.service import Service, ServiceType
import app.models  # ensure all models are registered

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Admin user
if not db.query(User).filter(User.email == settings.ADMIN_EMAIL).first():
    admin = User(
        email=settings.ADMIN_EMAIL,
        full_name="Loxion Mart Admin",
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    print(f"✅ Admin created: {settings.ADMIN_EMAIL}")
else:
    print("⚠️  Admin already exists")

# Kaybee Services
if not db.query(Business).filter(Business.slug == "kaybee-services").first():
    biz = Business(
        name="Kaybee Services",
        slug="kaybee-services",
        category=BusinessCategory.PHONES_TECH,
        description="Premium pre-owned iPhones and accessories. All devices tested and backed with a 30-day warranty.",
        location="Pretoria, GP",
        whatsapp_number="27712345678",
        banner_color="#0f172a",
        emoji="📱",
        commission_rate=0.08,
        is_featured=True,
    )
    db.add(biz)
    db.flush()
    services = [
        Service(business_id=biz.id, name="iPhone 13 (128GB)",     price=7500, emoji="📱", service_type=ServiceType.PRODUCT),
        Service(business_id=biz.id, name="iPhone 12 Pro (256GB)", price=6200, emoji="📱", service_type=ServiceType.PRODUCT),
        Service(business_id=biz.id, name="iPhone 11 (64GB)",      price=4800, emoji="📱", service_type=ServiceType.PRODUCT),
        Service(business_id=biz.id, name="AirPods Pro (Gen 2)",   price=2100, emoji="🎧", service_type=ServiceType.PRODUCT),
        Service(business_id=biz.id, name="Screen Repair",          price=450,  emoji="🔧", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Battery Replacement",    price=280,  emoji="🔋", service_type=ServiceType.BOOKING),
    ]
    db.add_all(services)
    print("✅ Kaybee Services seeded")

# Tshidi Hair Studio
if not db.query(Business).filter(Business.slug == "tshidi-hair-studio").first():
    biz = Business(
        name="Tshidi Hair Studio",
        slug="tshidi-hair-studio",
        category=BusinessCategory.HAIR_BEAUTY,
        description="Gauteng's go-to hair studio. From braids to weaves, relaxers to naturals — we do it all with love.",
        location="Pretoria, GP",
        whatsapp_number="27723456789",
        banner_color="#2d1b4e",
        emoji="💇",
        commission_rate=0.10,
        is_featured=True,
    )
    db.add(biz)
    db.flush()
    services = [
        Service(business_id=biz.id, name="Box Braids (Full)",  price=350, emoji="💆", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Weave Install",      price=280, emoji="✂️", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Wash & Style",       price=150, emoji="🚿", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Locs Retwist",       price=200, emoji="🌀", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Relaxer Touch-up",   price=180, emoji="💆", service_type=ServiceType.BOOKING),
        Service(business_id=biz.id, name="Kids Braids",        price=180, emoji="👧", service_type=ServiceType.BOOKING),
    ]
    db.add_all(services)
    print("✅ Tshidi Hair Studio seeded")

db.commit()
db.close()
print("\n🎉 Seed complete! Loxion Mart is ready.")
