from tour.extensions import *
from tour.config import Config


def db_connection():
    cnx_pool_db = pooling.MySQLConnectionPool(
        pool_name='travel_pool',
        pool_size=8,
        pool_reset_session=True,
        **Config.db_config
    )
    try:
        cnx = cnx_pool_db.get_connection()
        return cnx
    except mysql.connector.PoolError as err:
        print('Error: {}'.format(err))
    except mysql.connector.Error as err:
        print('Something goes wrong: {}'.format(err))


def data_query_one(sql, condition):
    cnx = db_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute(sql, condition)
        return cursor.fetchone()
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        cnx.close()

def data_query_one_dict(sql, condition):
    cnx = db_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        cursor.execute(sql, condition)
        return cursor.fetchone()
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        cnx.close()

def data_query_all_dict(sql, condition):
    cnx = db_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        cursor.execute(sql, condition)
        return cursor.fetchall()
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        cnx.close()


def data_query_all(sql, condition):
    cnx = db_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute(sql, condition)
        return cursor.fetchall()
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        cnx.close()


def insert_or_update(sql, condition):
    cnx = db_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute(sql, condition)
        cnx.commit()
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        cnx.close()

