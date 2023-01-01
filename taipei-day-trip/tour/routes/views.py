from flask import *

page = Blueprint('page', __name__)


# Pages
@page.route("/")
def index():
	return render_template("index.html")


@page.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")


@page.route("/booking")
def booking():
	return render_template("booking.html")


@page.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


@page.route('/member/orders')
def member_orders():
	return render_template('orders.html')



