import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JSON_SORT_KEYS = False
    PARTNER_KEY = os.environ.get('PARTNER_KEY')

    DB_NAME = 'taipei_tour'
    db_config = {
        'user': 'root',
        'password': os.environ.get('MYSQL_KEY'),
        'host': 'localhost',
        'database': DB_NAME
    }
    mysql_config = {
        'user': 'root',
        'password': os.environ.get('MYSQL_KEY'),
        'host': 'localhost'
    }

