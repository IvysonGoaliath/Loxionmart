"""Align PostgreSQL enum values with SQLAlchemy enum names.

Revision ID: 0002
Revises: 0001
"""

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


ENUM_CHANGES = {
    "userrole": [
        ("client", "CLIENT"),
        ("admin", "ADMIN"),
    ],
    "businesscategory": [
        ("hair_beauty", "HAIR_BEAUTY"),
        ("phones_tech", "PHONES_TECH"),
        ("food_catering", "FOOD_CATERING"),
        ("home_services", "HOME_SERVICES"),
        ("fashion", "FASHION"),
        ("other", "OTHER"),
    ],
    "servicetype": [
        ("booking", "BOOKING"),
        ("product", "PRODUCT"),
    ],
    "bookingstatus": [
        ("pending", "PENDING"),
        ("confirmed", "CONFIRMED"),
        ("completed", "COMPLETED"),
        ("cancelled", "CANCELLED"),
    ],
    "orderstatus": [
        ("pending_payment", "PENDING_PAYMENT"),
        ("paid", "PAID"),
        ("processing", "PROCESSING"),
        ("completed", "COMPLETED"),
        ("refunded", "REFUNDED"),
        ("cancelled", "CANCELLED"),
    ],
    "commissionstatus": [
        ("pending", "PENDING"),
        ("paid_out", "PAID_OUT"),
    ],
}


def upgrade():
    for enum_name, changes in ENUM_CHANGES.items():
        for old_value, new_value in changes:
            op.execute(
                f"ALTER TYPE {enum_name} "
                f"RENAME VALUE '{old_value}' TO '{new_value}'"
            )


def downgrade():
    for enum_name, changes in reversed(list(ENUM_CHANGES.items())):
        for old_value, new_value in reversed(changes):
            op.execute(
                f"ALTER TYPE {enum_name} "
                f"RENAME VALUE '{new_value}' TO '{old_value}'"
            )
