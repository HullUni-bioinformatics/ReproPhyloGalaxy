#!/usr/bin/env python

import os, sys
sys.path.insert( 0, os.path.dirname( __file__ ) )
from common import submit

try:
    assert sys.argv[2]
except IndexError:
    print 'usage: %s key url [name] ' % os.path.basename( sys.argv[0] )
    sys.exit( 1 )
try:
    data = {}
    data[ 'name' ] = sys.argv[3]
except IndexError:
    pass

submit( sys.argv[1], sys.argv[2], data )
