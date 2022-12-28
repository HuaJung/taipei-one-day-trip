from tour.routes.api import attractions as att, users, bookings, orders
# from tour.routes.api.booking import *
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

    api = Api(bookings.booking_api)
    api.add_resource(bookings.Booking, '/')

    api = Api(orders.order_api)
    api.add_resource(orders.Orders, '/orders')
    api.add_resource(orders.Order, '/order/<int:order_id>')

    app.register_blueprint(att.attraction_api, url_prefix='/api')
    app.register_blueprint(users.user_api, url_prefix='/api/user')
    app.register_blueprint(bookings.booking_api, url_prefix='/api/booking')
    app.register_blueprint(orders.order_api, url_prefix='/api')
    app.register_blueprint(page)

    return app
