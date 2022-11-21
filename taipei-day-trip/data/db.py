import mysql.connector
from mysql.connector import pooling, errorcode
import json
import re

DB_NAME = 'taipei_tour'

TABLES = {}
TABLES['categories'] = (
    """CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(30) UNIQUE KEY NOT NULL
    ) ENGINE=InnoDB"""
)

TABLES['mrt'] = (
    """CREATE TABLE IF NOT EXISTS mrt (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mrt VARCHAR(30) UNIQUE KEY
    ) ENGINE=InnoDB"""
)

TABLES['attractions'] = (
    """CREATE TABLE IF NOT EXISTS attractions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    origin_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    cat_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    transport TEXT NOT NULL,
    mrt_id BIGINT NOT NULL,
    lat FLOAT UNSIGNED NOT NULL,
    lng FLOAT UNSIGNED NOT NULL,
    FOREIGN KEY(cat_id) REFERENCES categories(id),
    FOREIGN KEY(mrt_id) REFERENCES mrt(id)
    ) ENGINE=InnoDB"""
)

TABLES['images'] = (
    """CREATE TABLE IF NOT EXISTS images(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    att_id BIGINT NOT NULL,
    image TEXT NOT NULL,
    FOREIGN KEY(att_id) REFERENCES attractions(id)
    ) ENGINE=InnoDB"""
)

config = {
    'user': 'root',
    'password': '',
    'host': 'localhost'
}
db_config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': DB_NAME
}

cnx_pool = pooling.MySQLConnectionPool(
    pool_name='travel_pool',
    pool_size=8,
    pool_reset_session=True,
    **config
)


def create_database(cursor):
    try:
        cursor.execute('USE {}'.format(DB_NAME))
    except mysql.connector.Error as err:
        print('Database {} does not exists.'.format(DB_NAME))
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            cursor.execute("CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(DB_NAME))
            print('Database {} created successfully.'.format(DB_NAME))
            cursor.execute('USE {}'.format(DB_NAME))
        else:
            print('Failed creating database: {}'.format(err))
            exit(1)


def create_tables(cnx, cursor):
    for table_name in TABLES:
        table_description = TABLES[table_name]
        try:
            print('Creating table {}: '.format(table_name), end='')
            cursor.execute(table_description)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                print('already exist.')
            else:
                print(err.msg)
        else:
            print('OK')
    cursor.close()
    cnx.close()


def process_data():
    cnx = db_connection()
    cursor = cnx.cursor()
    with open('taipei-attractions.json', 'r', encoding='utf-8') as json_obj:
        get_data = json.load(json_obj)
        attractions = get_data['result']['results']
    att_id = 1
    for attraction in attractions:
        origin_id = attraction['_id']
        att_name = attraction['name']
        category = attraction['CAT']
        description = attraction['description']
        address = attraction['address']
        transport = attraction['direction']
        mrt = attraction['MRT']
        lat = attraction['latitude']
        lng = attraction['longitude']
        imgs = attraction['file'].split('http')
        cat_query = 'SELECT id FROM categories WHERE category=%s'
        mrt_query = 'SELECT id FROM mrt WHERE mrt=%s'
        cat_id = data_query_one(cat_query, (category,))
        mrt_id = data_query_one(mrt_query, (mrt,))

        if cat_id is None:
            add_category = (
                "INSERT INTO categories (category)"
                "VAlUES (%s)"
            )
            cursor.execute(add_category, (category,))
            cat_id = cursor.lastrowid  # update to the latest cat_id
        else:
            cat_id = cat_id[0]

        if mrt_id is None:
            add_mrt = (
                "INSERT INTO mrt (mrt)"
                "VALUES (%s)"
            )
            cursor.execute(add_mrt, (mrt,))
            mrt_id = cursor.lastrowid  # update to the latest mrt_id
        else:
            mrt_id = mrt_id[0]

        add_attraction = (
            "INSERT INTO attractions (origin_id, name, cat_id, description, address, transport, mrt_id, lat, lng)"
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        cursor.execute(add_attraction, (origin_id, att_name, cat_id, description, address, transport, mrt_id, lat, lng))

        add_image = (
            "INSERT INTO images (att_id, image)"
            "VALUES (%s, %s)"
        )
        for img in imgs:
            img = 'http' + img
            if re.match(r'jpg', img[-3:], re.IGNORECASE) or re.match(r'png', img[-3:], re.IGNORECASE):
                cursor.execute(add_image, (att_id, img))

        cnx.commit()
        att_id += 1
    cnx.close()


def db_connection():
    cnx_pool_db = pooling.MySQLConnectionPool(
        pool_name='travel_pool',
        pool_size=8,
        pool_reset_session=True,
        **db_config
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
    cursor = cnx.cursor(buffered=True)
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


def main():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        create_database(cursor)
        create_tables(cnx, cursor)
        process_data()
    except mysql.connector.PoolError as err:
        print('Error: {}'.format(err))
    except mysql.connector.Error as err:
        print('Something goes wrong: {}'.format(err))


if __name__ == '__main__':
    main()