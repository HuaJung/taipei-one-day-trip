from flask_restful import Resource, Api, reqparse
from tour.models.db import data_query_one, data_query_all, insert_or_update, data_query_all_dict
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()