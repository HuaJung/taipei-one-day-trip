from tour.routes.api.attractions import *
from tour.routes.api.users import *
from tour.routes.view import *
from tour.extensions import *
from tour.config import Config


def create_app(test_config=None):
    app = Flask(__name__, static_folder='data', static_url_path='/')
    if test_config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(test_config)

    bcrypt.init_app(app)

    attraction_api = Blueprint('attraction_api', __name__)
    api = Api(attraction_api)
    api.add_resource(AttractionPage, '/attractions')
    api.add_resource(AttractionID, '/attraction/<int:att_id>')
    api.add_resource(Category, '/categories')

    user_api = Blueprint('user_api', __name__)
    api = Api(user_api)
    api.add_resource(Register, '/')
    api.add_resource(Auth, '/auth')

    app.register_blueprint(attraction_api, url_prefix='/api')
    app.register_blueprint(user_api, url_prefix='/api/user')
    app.register_blueprint(page)

    return app
