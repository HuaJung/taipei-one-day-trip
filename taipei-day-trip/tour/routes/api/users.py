import re

from flask import *
from tour.extensions import *
from tour.models.db_sql import data_query_one, insert_or_update
from tour.models.schema import UserSchema


user_api = Blueprint('user_api', __name__)
register_schema = UserSchema(exclude=['phone'])
login_schema = UserSchema(only=['email', 'password'])


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
        errors = register_schema.validate(request.json)
        if errors:
            return errors, 400
        try:
            user_data = register_schema.load(request.json)
            email_sql = 'SELECT id FROM members WHERE email = %s'
            repeat_email = data_query_one(email_sql, (user_data['email'],))
            if repeat_email is None:
                pw_hash = bcrypt.generate_password_hash(user_data['password'])
                register_sql = 'INSERT INTO members (name, email, password) VALUES (%s, %s, %s)'
                insert_or_update(register_sql, (user_data['name'], user_data['email'], pw_hash))
                return make_response(jsonify(ok=True))
            return make_response((jsonify(error=True, message='此郵件已註冊'), 400))
        except KeyError:
            return make_response(jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'), 500)


class Auth(Resource):
    @token_required
    def get(self, user_id):
        """Acquire the Current Login Info"""
        user_info_sql = 'SELECT name, email, phone FROM members WHERE id= %s'
        user_info = data_query_one(user_info_sql, (user_id,))
        name, email, phone = user_info
        return make_response(jsonify(data={'id': user_id, 'name': name, 'email': email, 'phone': phone}))

    def put(self):
        """User Login"""
        errors = login_schema.validate(request.json)
        if errors:
            return errors, 400
        try:
            user_data = login_schema.load(request.json)
            email = user_data['email']
            pwd = user_data['password']
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
            return make_response((jsonify(error=True, message='郵箱或密碼錯誤'), 400))
        except KeyError:
            return make_response(jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'), 500)

    def delete(self):
        """User Logout"""
        if request.cookies.get('token'):
            res = make_response(jsonify(ok=True))
            res.set_cookie(key='token', value='', max_age=-1, path='/api')
            return res
        return make_response((jsonify(message='not login yet')))

    @token_required
    def patch(self, user_id):
        """Modify User Info"""
        phone_pattern = r'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'
        space_pattern = r'^\s*$'
        email_pattern = r'^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$'
        try:
            if request.is_json:
                data = request.get_json()
                if data['name']:
                    new_name = data['name']
                    name_sql = 'UPDATE members SET name = %s WHERE id = %s'
                    insert_or_update(name_sql, (new_name, user_id))
                if data['email']:
                    new_email = data['email']
                    if re.match(email_pattern, new_email) is None:
                        return make_response((jsonify(error=True, message='格式錯誤'), 400))
                    email_sql = 'UPDATE members SET email = %s WHERE id = %s'
                    insert_or_update(email_sql, (new_email, user_id))
                if data['password']:
                    new_pwd = data['password']
                    if len(new_pwd) < 3 or len(new_pwd) > 30 or re.match(space_pattern, new_pwd):
                        return make_response((jsonify(error=True, message='格式錯誤'), 400))
                    pwd_sql = 'UPDATE members SET password = %s WHERE id = %s'
                    insert_or_update(pwd_sql, (new_pwd, user_id))
                if data['phone']:
                    new_phone = data['phone']
                    if len(new_phone) < 7 or len(new_phone) > 25 or re.match(space_pattern, new_phone) or \
                            re.match(phone_pattern, new_phone) is None:
                        return make_response((jsonify(error=True, message='格式錯誤'), 400))
                    phone_sql = 'UPDATE members SET phone = %s WHERE id = %s'
                    insert_or_update(phone_sql, (new_phone, user_id))
                return make_response(jsonify(ok=True))
            else:
                return make_response((jsonify(error=True, message='格式錯誤'), 400))
        except KeyError:
            return make_response(jsonify(error=True, message='內部伺服器錯誤，請稍後再試。'), 500)

