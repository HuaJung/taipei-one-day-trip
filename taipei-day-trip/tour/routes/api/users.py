from flask import *
from tour.extensions import *
from tour.models.db_sql import data_query_one, insert_or_update

user_api = Blueprint('user_api', __name__)
parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('email', required=True)
parser.add_argument('password', required=True)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if token is None:
            return make_response(jsonify(data=None))
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload['user_id']
            return f(*args, user_id, **kwargs)
        except jwt.ExpiredSignatureError:
            return make_response(jsonify(data=None))
    return decorated


class Register(Resource):
    def post(self):
        args = parser.parse_args()
        # args = request.get_json()
        try:
            email_sql = 'SELECT id FROM members WHERE email = %s'
            repeat_email = data_query_one(email_sql, (args['email'],))
            if repeat_email is None:
                pw_hash = bcrypt.generate_password_hash(args['password'])
                register_sql = 'INSERT INTO members (name, email, password) VALUES (%s, %s, %s)'
                insert_or_update(register_sql, (args['name'], args['email'], pw_hash))
                return make_response(jsonify(ok=True))
            return make_response((jsonify(error=True, message='此郵件已註冊'), 400))
        except KeyError:
            abort(500, message=jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'))


class Auth(Resource):
    @token_required
    def get(self, user_id):
        """Acquire the Current Login Info"""
        user_info_sql = 'SELECT name, email FROM members WHERE id= %s'
        user_info = data_query_one(user_info_sql, (user_id,))
        name, email = user_info
        return make_response(jsonify(data={'id': user_id, 'name': name, 'email': email}))

    def put(self):
        """User Login"""
        try:
            args = parser.parse_args()
            # args = request.get_json()
            email = args['email']
            pwd = args['password']
            auth_sql = 'SELECT id, password FROM members WHERE email = %s'
            has_record = data_query_one(auth_sql, (email,))
            if has_record:
                user_id, pw_hash = has_record
                if bcrypt.check_password_hash(pw_hash, pwd):
                    token = jwt.encode({
                        'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=7)
                    }, current_app.config['SECRET_KEY'])
                    res = make_response(jsonify(ok=True))
                    res.set_cookie(key='token', value=token, max_age=7*24*60*60, path='/api')
                    return res
                    # save_to_cookie = f'token={token}; Max-Age={7 * 24 * 60 * 60}; Path="/api"'
                    # return make_response(jsonify(ok=True), 200, {'Set-Cookie': save_to_cookie})
            return make_response((jsonify(error=True, message='郵箱或密碼錯誤'), 400))
        except KeyError:
            abort(500, message=jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'))

    def delete(self):
        """User Logout"""
        if request.cookies.get('token'):
            res = make_response(jsonify(ok=True))
            res.set_cookie(key='token', value='', max_age=-1, path='/api')
            return res
        return make_response((jsonify(message='not login yet')))
