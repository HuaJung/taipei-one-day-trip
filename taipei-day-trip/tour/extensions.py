from flask_restful import Resource, Api, reqparse
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow

import jwt
from datetime import datetime, timedelta
from functools import wraps
# ------ for database -------
import mysql.connector
from mysql.connector import pooling, errorcode
import json
import re
import os


bcrypt = Bcrypt()
ma = Marshmallow()