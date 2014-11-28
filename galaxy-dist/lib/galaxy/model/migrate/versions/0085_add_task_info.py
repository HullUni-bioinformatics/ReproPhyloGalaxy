"""
Migration script to add 'info' column to the task table.
"""

from sqlalchemy import *
from sqlalchemy.orm import *
from migrate import *
from migrate.changeset import *

import logging
log = logging.getLogger( __name__ )
from galaxy.model.custom_types import TrimmedString

metadata = MetaData()

def upgrade(migrate_engine):
    metadata.bind = migrate_engine
    print __doc__
    metadata.reflect()
    try:
        task_table = Table( "task", metadata, autoload=True )
        c = Column( "info", TrimmedString (255) , nullable=True )
        c.create( task_table )
        assert c is task_table.c.info
    except Exception, e:
        print "Adding info column to table table failed: %s" % str( e )
        log.debug( "Adding info column to task table failed: %s" % str( e ) )

def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    metadata.reflect()
    try:
        task_table = Table( "task", metadata, autoload=True )
        task_table.c.info.drop()
    except Exception, e:
        print "Dropping info column from task table failed: %s" % str( e )
        log.debug( "Dropping info column from task table failed: %s" % str( e ) )
