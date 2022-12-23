from tour.routes.api import attractions as att, users
from tour.routes.api.booking import *
from tour.routes.views import *
from tour.extensions import *
from tour.config import Config


def create_app(test_config=None):
    app = Flask(__name__, static_folder='data', static_url_path='/')
    if test_config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(test_config)

    bcrypt.init_app(app)
    ma.init_app(app)

    api = Api(att.attraction_api)
    api.add_resource(att.AttractionPage, '/attractions')
    api.add_resource(att.AttractionID, '/attraction/<int:att_id>')
    api.add_resource(att.Category, '/categories')

    api = Api(users.user_api)
    api.add_resource(users.Register, '/')
    api.add_resource(users.Auth, '/auth')

    booking_api = Blueprint('booking_api', __name__)
    api = Api(booking_api)
    api.add_resource(Booking, '/')

    app.register_blueprint(att.attraction_api, url_prefix='/api')
    app.register_blueprint(users.user_api, url_prefix='/api/user')
    app.register_blueprint(booking_api, url_prefix='/api/booking')
    app.register_blueprint(page)

    return app
