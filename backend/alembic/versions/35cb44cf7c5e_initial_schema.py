"""initial schema

Revision ID: 35cb44cf7c5e
Revises: 
Create Date: 2026-08-20 23:42:48.631617

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35cb44cf7c5e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop orders table (UUID-based) and recreate with Integer ID
    op.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey")
    op.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey")
    op.drop_table("orders")

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("product_title", sa.String(), nullable=False),
        sa.Column("buyer_username", sa.String(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Fix products table columns
    op.alter_column('products', 'description',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               nullable=False)
    op.alter_column('products', 'price',
               existing_type=sa.NUMERIC(precision=10, scale=2),
               type_=sa.Float(),
               existing_nullable=False)
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_title'), 'products', ['title'], unique=False)
    op.drop_constraint(op.f('positive_price_check'), 'products', type_='check')
    op.drop_constraint(op.f('valid_location_check'), 'products', type_='check')


def downgrade() -> None:
    """Downgrade schema."""
    op.create_check_constraint(op.f('valid_location_check'), 'products', "location::text = ANY (ARRAY['JO'::character varying, 'SA'::character varying]::text[])")
    op.create_check_constraint(op.f('positive_price_check'), 'products', 'price >= 0::numeric')
    op.drop_index(op.f('ix_products_title'), table_name='products')
    op.drop_index(op.f('ix_products_id'), table_name='products')
    op.alter_column('products', 'price',
               existing_type=sa.Float(),
               type_=sa.NUMERIC(precision=10, scale=2),
               existing_nullable=False)
    op.alter_column('products', 'description',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               nullable=True)

    op.drop_table("orders")
    op.create_table(
        "orders",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("product_title", sa.String(), nullable=False),
        sa.Column("buyer_username", sa.String(), nullable=False),
        sa.Column("unit_price", sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(op.f('ix_orders_user_id'), 'orders', ['user_id'], unique=False)
