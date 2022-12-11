import os
import dotenv


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JSON_SORT_KEYS = False
