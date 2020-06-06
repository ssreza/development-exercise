"""empty message

Revision ID: acff8445f25a
Revises: None
Create Date: 2016-11-12 11:38:22.735970

"""

# revision identifiers, used by Alembic.
revision = 'acff8445f25a'
down_revision = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('facilities',
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('modified_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('facility_name', sa.String(), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('phone_number', sa.String(), nullable=True),
    sa.Column('twilio_number', sa.String(), nullable=True),
    sa.Column('facility_type', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('modified_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('facility_id', sa.Integer(), nullable=True),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('cell_number', sa.String(), nullable=False),
    sa.Column('email', sa.String(length=60), nullable=False),
    sa.Column('password', sa.Binary(), nullable=False),
    sa.Column('user_type', sa.String(), nullable=True),
    sa.Column('dob', sa.DateTime(), nullable=True),
    sa.Column('token', sa.String(), nullable=True),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.Column('confirmed_at', sa.DateTime(), nullable=True),
    sa.Column('last_login_at', sa.DateTime(), nullable=True),
    sa.Column('current_login_at', sa.DateTime(), nullable=True),
    sa.Column('facility_name', sa.String(), nullable=True),
    sa.Column('last_login_ip', sa.String(length=45), nullable=True),
    sa.Column('current_login_ip', sa.String(length=45), nullable=True),
    sa.Column('login_count', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['facility_id'], ['facilities.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    op.drop_table('facilities')
    ### end Alembic commands ###