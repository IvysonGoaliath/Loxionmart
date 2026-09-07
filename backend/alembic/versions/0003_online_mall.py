"""Add shop ownership, catalogue details, saved collections and durable media.
Existing shops remain approved; no existing IDs or transactions are replaced.
"""
from alembic import op
import sqlalchemy as sa
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("businesses", sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True))
    op.create_index("ix_businesses_owner_id", "businesses", ["owner_id"])
    op.add_column("businesses", sa.Column("approval_status", sa.String(20), nullable=False, server_default="approved"))
    for name in ("review_note", "logo_url", "cover_url", "opening_hours", "collection_info", "delivery_info", "returns_info"):
        op.add_column("businesses", sa.Column(name, sa.Text(), nullable=True))
    op.add_column("services", sa.Column("image_urls", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("services", sa.Column("specifications", sa.JSON(), nullable=False, server_default="{}"))
    op.add_column("services", sa.Column("stock_quantity", sa.Integer(), nullable=True))
    op.add_column("services", sa.Column("duration_minutes", sa.Integer(), nullable=True))
    op.create_table("saved_items", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("kind", sa.String(10), nullable=False), sa.Column("target_id", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime()), sa.UniqueConstraint("user_id", "kind", "target_id", name="uq_saved_target"))
    op.create_index("ix_saved_items_user_id", "saved_items", ["user_id"])
    op.create_table("media_assets", sa.Column("id", sa.String(36), primary_key=True), sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("content_type", sa.String(30), nullable=False), sa.Column("byte_size", sa.Integer(), nullable=False), sa.Column("data", sa.LargeBinary(), nullable=False), sa.Column("created_at", sa.DateTime()))
    op.create_index("ix_media_assets_owner_id", "media_assets", ["owner_id"])

def downgrade():
    op.drop_table("media_assets")
    op.drop_table("saved_items")
    for name in ("duration_minutes", "stock_quantity", "specifications", "image_urls"):
        op.drop_column("services", name)
    op.drop_index("ix_businesses_owner_id", table_name="businesses")
    for name in ("returns_info", "delivery_info", "collection_info", "opening_hours", "cover_url", "logo_url", "review_note", "approval_status", "owner_id"):
        op.drop_column("businesses", name)
