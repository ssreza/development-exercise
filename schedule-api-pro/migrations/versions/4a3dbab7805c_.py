"""empty message

Revision ID: 4a3dbab7805c
Revises: f9de6d5c6c71
Create Date: 2016-12-26 13:34:33.601530

"""

# revision identifiers, used by Alembic.
revision = '4a3dbab7805c'
down_revision = 'f9de6d5c6c71'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('facilities', sa.Column('image_url', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('facilities', 'image_url')
    ### end Alembic commands ###
