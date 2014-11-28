"""
Migration script to add a synopsis column to the library table.
"""

from sqlalchemy import *
from migrate import *
from migrate.changeset import *

import logging
log = logging.getLogger( __name__ )

metadata = MetaData()

def upgrade(migrate_engine):
    metadata.bind = migrate_engine
    print __doc__
    metadata.reflect()

    Library_table = Table( "library", metadata, autoload=True )
    c = Column( "synopsis", TEXT )
    c.create( Library_table )
    assert c is Library_table.c.synopsis

def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    pass
