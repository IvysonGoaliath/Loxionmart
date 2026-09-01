"""Initial schema — all tables

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table('users',
        sa.Column('id',              sa.Integer(),     nullable=False),
        sa.Column('email',           sa.String(),      nullable=False),
        sa.Column('full_name',       sa.String(),      nullable=False),
        sa.Column('phone',           sa.String(),      nullable=True),
        sa.Column('hashed_password', sa.String(),      nullable=False),
        sa.Column('role',            sa.Enum('client','admin', name='userrole'), nullable=True),
        sa.Column('is_active',       sa.Boolean(),     nullable=True),
        sa.Column('created_at',      sa.DateTime(),    nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_id',    'users', ['id'])

    # businesses
    op.create_table('businesses',
        sa.Column('id',              sa.Integer(),     nullable=False),
        sa.Column('name',            sa.String(),      nullable=False),
        sa.Column('slug',            sa.String(),      nullable=False),
        sa.Column('category',        sa.Enum('hair_beauty','phones_tech','food_catering','home_services','fashion','other', name='businesscategory'), nullable=False),
        sa.Column('description',     sa.Text(),        nullable=True),
        sa.Column('location',        sa.String(),      nullable=True),
        sa.Column('whatsapp_number', sa.String(),      nullable=True),
        sa.Column('banner_color',    sa.String(),      nullable=True),
        sa.Column('emoji',           sa.String(),      nullable=True),
        sa.Column('commission_rate', sa.Float(),       nullable=True),
        sa.Column('is_featured',     sa.Boolean(),     nullable=True),
        sa.Column('is_active',       sa.Boolean(),     nullable=True),
        sa.Column('created_at',      sa.DateTime(),    nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_businesses_id',   'businesses', ['id'])
    op.create_index('ix_businesses_slug', 'businesses', ['slug'], unique=True)

    # services
    op.create_table('services',
        sa.Column('id',           sa.Integer(),  nullable=False),
        sa.Column('business_id',  sa.Integer(),  nullable=False),
        sa.Column('name',         sa.String(),   nullable=False),
        sa.Column('description',  sa.Text(),     nullable=True),
        sa.Column('price',        sa.Float(),    nullable=False),
        sa.Column('emoji',        sa.String(),   nullable=True),
        sa.Column('service_type', sa.Enum('booking','product', name='servicetype'), nullable=True),
        sa.Column('is_available', sa.Boolean(),  nullable=True),
        sa.Column('created_at',   sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_services_id', 'services', ['id'])

    # bookings
    op.create_table('bookings',
        sa.Column('id',             sa.Integer(),  nullable=False),
        sa.Column('client_id',      sa.Integer(),  nullable=False),
        sa.Column('business_id',    sa.Integer(),  nullable=False),
        sa.Column('service_id',     sa.Integer(),  nullable=True),
        sa.Column('notes',          sa.Text(),     nullable=True),
        sa.Column('preferred_date', sa.DateTime(), nullable=True),
        sa.Column('status',         sa.Enum('pending','confirmed','completed','cancelled', name='bookingstatus'), nullable=True),
        sa.Column('total_amount',   sa.Float(),    nullable=True),
        sa.Column('created_at',     sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id']),
        sa.ForeignKeyConstraint(['client_id'],   ['users.id']),
        sa.ForeignKeyConstraint(['service_id'],  ['services.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_bookings_id', 'bookings', ['id'])

    # orders
    op.create_table('orders',
        sa.Column('id',                  sa.Integer(),  nullable=False),
        sa.Column('client_id',           sa.Integer(),  nullable=False),
        sa.Column('business_id',         sa.Integer(),  nullable=False),
        sa.Column('status',              sa.Enum('pending_payment','paid','processing','completed','refunded','cancelled', name='orderstatus'), nullable=True),
        sa.Column('subtotal',            sa.Float(),    nullable=False),
        sa.Column('commission_amount',   sa.Float(),    nullable=False),
        sa.Column('total_amount',        sa.Float(),    nullable=False),
        sa.Column('ozow_transaction_id', sa.String(),   nullable=True),
        sa.Column('ozow_payment_url',    sa.String(),   nullable=True),
        sa.Column('notes',               sa.Text(),     nullable=True),
        sa.Column('created_at',          sa.DateTime(), nullable=True),
        sa.Column('paid_at',             sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id']),
        sa.ForeignKeyConstraint(['client_id'],   ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_orders_id', 'orders', ['id'])

    # order_items
    op.create_table('order_items',
        sa.Column('id',          sa.Integer(), nullable=False),
        sa.Column('order_id',    sa.Integer(), nullable=False),
        sa.Column('service_id',  sa.Integer(), nullable=False),
        sa.Column('quantity',    sa.Integer(), nullable=True),
        sa.Column('unit_price',  sa.Float(),   nullable=False),
        sa.Column('total_price', sa.Float(),   nullable=False),
        sa.ForeignKeyConstraint(['order_id'],   ['orders.id']),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_order_items_id', 'order_items', ['id'])

    # commissions
    op.create_table('commissions',
        sa.Column('id',          sa.Integer(),  nullable=False),
        sa.Column('business_id', sa.Integer(),  nullable=False),
        sa.Column('order_id',    sa.Integer(),  nullable=True),
        sa.Column('amount',      sa.Float(),    nullable=False),
        sa.Column('rate',        sa.Float(),    nullable=False),
        sa.Column('status',      sa.Enum('pending','paid_out', name='commissionstatus'), nullable=True),
        sa.Column('created_at',  sa.DateTime(), nullable=True),
        sa.Column('paid_out_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id']),
        sa.ForeignKeyConstraint(['order_id'],    ['orders.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_commissions_id', 'commissions', ['id'])


def downgrade() -> None:
    op.drop_table('commissions')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('bookings')
    op.drop_table('services')
    op.drop_table('businesses')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS commissionstatus')
    op.execute('DROP TYPE IF EXISTS orderstatus')
    op.execute('DROP TYPE IF EXISTS bookingstatus')
    op.execute('DROP TYPE IF EXISTS servicetype')
    op.execute('DROP TYPE IF EXISTS businesscategory')
    op.execute('DROP TYPE IF EXISTS userrole')
