from flask import *
from tour.extensions import *
from tour.models.schema import BookingAttractionSchema
from tour.models.db_sql import data_query_one_dict, data_query_one, insert_or_update

booking_api = Blueprint('booking_api', __name__)
booking_schema = BookingAttractionSchema()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if token is None:
            return make_response(jsonify(error=True, message='尚未登入，請重新登入'), 403)
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload['user_id']
            return f(*args, user_id, **kwargs)
        except jwt.ExpiredSignatureError:
            return make_response(jsonify(error=True, message='建立失敗，請重新登入'), 400)
    return decorated


class Booking(Resource):
    @token_required
    def post(self, user_id):
        errors = booking_schema.validate(request.json)
        if errors:
            return errors, 400
        try:
            booking_data = booking_schema.load(request.json)
            att_id = booking_data['attractionId']
            date = booking_data['date']
            time = booking_data['time']
            price = booking_data['price']
            record_sql = 'SELECT user_id FROM booking WHERE user_id=%s'
            has_record = data_query_one(record_sql, (user_id,))
            if has_record:
                update_sql = """UPDATE booking SET att_id = %s, date = %s, time = %s, price = %s 
                WHERE user_id = %s"""
                insert_or_update(update_sql, (att_id, date, time, price, user_id))
            elif has_record is None:
                insert_sql = 'INSERT INTO booking (user_id, att_id, date, time, price) VALUES (%s, %s, %s, %s,%s)'
                insert_or_update(insert_sql, (user_id, att_id, date, time, price))
            return make_response(jsonify(ok=True))
        except KeyError:
            return make_response(jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'), 500)

    @token_required
    def get(self, user_id):
        booking_sql = """SELECT CONCAT_WS(',', a.id, a.name, a.address, i.image) AS attraction, 
        b.date, b.time, b.price FROM attractions a INNER JOIN booking b ON a.id = b.att_id 
        INNER JOIN images i ON a.id = i.att_id WHERE b.user_id = %s LIMIT 1"""
        booking_data = data_query_one_dict(booking_sql, (user_id,))
        if booking_data:
            # rebuild api format for attraction
            attraction_info = {}
            attraction_lst = booking_data['attraction'].split(',')
            attraction_info['id'] = attraction_lst[0]
            attraction_info['name'] = attraction_lst[1]
            attraction_info['address'] = attraction_lst[2]
            attraction_info['image'] = attraction_lst[-1]
            booking_data['attraction'] = attraction_info
            booking_data['date'] = str(booking_data['date'])
            return make_response(jsonify(data=booking_data))
        else:
            return make_response(jsonify(data=None))

    @token_required
    def delete(self, user_id):
        record_sql = 'SELECT user_id FROM booking WHERE user_id=%s'
        has_record = data_query_one(record_sql, (user_id,))
        if has_record:
            delete_sql = """DELETE FROM booking WHERE user_id=%s"""
            insert_or_update(delete_sql, (user_id,))
            return make_response(jsonify(ok=True))
        else:
            return make_response(jsonify(error=True, message='no booking record'), 400)
