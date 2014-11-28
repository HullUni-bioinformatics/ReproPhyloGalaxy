"""
Migration script to add 'ldda_id' column to the implicitly_converted_dataset_association table.
"""

from sqlalchemy import *
from sqlalchemy.orm import *
from migrate import *
from migrate.changeset import *

import logging
log = logging.getLogger( __name__ )

metadata = MetaData()

def upgrade(migrate_engine):
    metadata.bind = migrate_engine
    print __doc__
    metadata.reflect()
    try:
        Implicitly_converted_table = Table( "implicitly_converted_dataset_association", metadata, autoload=True )
        if migrate_engine.name != 'sqlite':
            c = Column( "ldda_id", Integer, ForeignKey( "library_dataset_dataset_association.id" ), index=True, nullable=True )
        else:
            c = Column( "ldda_id", Integer, index=True, nullable=True )
        c.create( Implicitly_converted_table, index_name="ix_implicitly_converted_ds_assoc_ldda_id")
        assert c is Implicitly_converted_table.c.ldda_id
    except Exception, e:
        print "Adding ldda_id column to implicitly_converted_dataset_association table failed: %s" % str( e )
        log.debug( "Adding ldda_id column to implicitly_converted_dataset_association table failed: %s" % str( e ) )

def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    metadata.reflect()
    try:
        Implicitly_converted_table = Table( "implicitly_converted_dataset_association", metadata, autoload=True )
        Implicitly_converted_table.c.ldda_id.drop()
    except Exception, e:
        print "Dropping ldda_id column from implicitly_converted_dataset_association table failed: %s" % str( e )
        log.debug( "Dropping ldda_id column from implicitly_converted_dataset_association table failed: %s" % str( e ) )
