from flask import *
from tour.extensions import *
from tour.models.schema import OderSchema
from tour.models.db_sql import insert_or_update, data_query_all_dict

order_api = Blueprint('order_api', __name__)
order_schema = OderSchema()

sandbox_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
production_url = 'https://prod.tappaysdk.com/tpc/payment/pay-by-prime'


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if token is None:
            return make_response(jsonify(error=True, message='尚未登入，請重新登入'), 403)
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload['user_id']
            return f(*args, user_id=user_id, **kwargs)
        except jwt.ExpiredSignatureError:
            return make_response(jsonify(error=True, message='建立失敗，請重新登入'), 400)
    return decorated


class Orders(Resource):
    @token_required
    def post(self, user_id):
        errors = order_schema.validate(request.json)
        if errors:
            return errors, 400
        order_data = order_schema.load(request.json)
        order_datetime = datetime.now().strftime('%Y%m%d%H%M%S')
        order_number = order_datetime + str(user_id).zfill(4)
        bank_trans_id = 'BB' + order_number
        trip_date = order_data['order']['trip']['date']
        trip_time = order_data['order']['trip']['time']
        trip_price = order_data['order']['price']
        att_id = order_data['order']['trip']['attraction']['id']
        phone = order_data['order']['contact']['phone']
        payment_status = 1  # unpaid: 1; paid: 0

        # create an order
        order_sql = """INSERT INTO orders (order_no, date, time, price, att_id, user_id) 
        VALUES (%s, %s, %s, %s, %s, %s)"""
        phone_sql = 'UPDATE members SET phone = %s WHERE id = %s'
        payment_sql = 'INSERT INTO payments (status, bank_trans_id, order_no) VALUES (%s, %s, %s)'
        insert_or_update(order_sql, (order_number, trip_date, trip_time, trip_price, att_id, user_id))
        insert_or_update(phone_sql, (phone, user_id))
        insert_or_update(payment_sql, (payment_status, bank_trans_id, order_number))

        # request TapPay server
        headers = {'Content-Type': 'application/json', 'x-api-key': current_app.config['PARTNER_KEY']}
        payload = {
            'prime': order_data['prime'],
            'partner_key': current_app.config['PARTNER_KEY'],
            'merchant_id': 'panda_ESUN',
            'amount': trip_price,
            'bank_transaction_id': bank_trans_id,
            'details': order_data['order']['trip']['attraction']['name'],
            'cardholder': {
                'phone_number': phone,
                'name': order_data['order']['contact']['name'],
                'email': order_data['order']['contact']['email'],
            }
        }
        try:
            response = requests.post(sandbox_url, json=payload, headers=headers, timeout=30)
            print(response.json())
            r = response.json()
            if r['status'] == 0:
                rec_trade_id = r['rec_trade_id']
                payment_status = 0
                update_payment_sql = 'UPDATE payments SET status = %s , rec_trade_id = %s WHERE order_no = %s'
                insert_or_update(update_payment_sql, (payment_status, rec_trade_id, order_number))
                payment_message = '付款成功'
            else:
                payment_message = '付款失敗'

            payment_result = {
                'number': order_number,
                'payment': {
                    'status': payment_status,
                    'message': payment_message
                }
            }
            delete_booking = 'DELETE FROM booking WHERE user_id = %s'
            insert_or_update(delete_booking, (user_id,))
            return make_response(jsonify(data=payment_result))

        except KeyError:
            return make_response(jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'), 500)


class Order(Resource):
    @token_required
    def get(self, order_id, user_id):
        order_sql = """SELECT o.order_no AS number, o.price, 
        (SELECT CONCAT_WS(',', a.id, a.name, a.address, i.image, o.date, o.time) FROM attractions a INNER JOIN images i 
        ON a.id = i.att_id INNER JOIN orders o ON a.id = o.att_id WHERE o.order_no = %s LIMIT 1) 
        AS trip, (SELECT CONCAT_WS(',', m.name, m.email, m.phone) FROM members m WHERE m.id = %s) 
        AS contact, p.status from orders o INNER JOIN payments p ON o.order_no = p.order_no WHERE o.order_no = %s"""
        order_info = data_query_all_dict(order_sql, (order_id, user_id, order_id))[0]
        if order_info:
            trip_lst = order_info['trip'].split(',')
            trip_dict = {
                'attraction': {
                    'id': trip_lst[0],
                    'name': trip_lst[1],
                    'address': trip_lst[2],
                    'image': trip_lst[3]
                },
                'date': trip_lst[4],
                'time': trip_lst[5]
            }
            contact_lst = order_info['contact'].split(',')
            contact_dict = {
                'name': contact_lst[0],
                'email': contact_lst[1],
                'phone': contact_lst[2]
            }
            order_info['trip'] = trip_dict
            order_info['contact'] = contact_dict
            return make_response(jsonify(data=order_info))
        return make_response(jsonify(data=None))

