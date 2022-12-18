import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JSON_SORT_KEYS = False
    DB_NAME = 'taipei_tour'
    db_config = {
        'user': 'root',
        'password': os.environ.get('MYSQL_KEY'),
        'host': 'localhost',
        'database': DB_NAME
    }
    config = {
        'user': 'root',
        'password': os.environ.get('MYSQL_KEY'),
        'host': 'localhost'
    }

