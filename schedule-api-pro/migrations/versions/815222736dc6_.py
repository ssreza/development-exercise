"""empty message

Revision ID: 815222736dc6
Revises: fd652cb887e8
Create Date: 2016-12-15 10:27:31.994467

"""

# revision identifiers, used by Alembic.
revision = '815222736dc6'
down_revision = 'fd652cb887e8'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('time_slots', sa.Column('recurring', sa.Boolean(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('time_slots', 'recurring')
    ### end Alembic commands ###
