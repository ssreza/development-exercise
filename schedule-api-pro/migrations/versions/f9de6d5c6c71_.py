"""empty message

Revision ID: f9de6d5c6c71
Revises: 815222736dc6
Create Date: 2016-12-26 12:54:35.941565

"""

# revision identifiers, used by Alembic.
revision = 'f9de6d5c6c71'
down_revision = '815222736dc6'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('image_url', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'image_url')
    ### end Alembic commands ###