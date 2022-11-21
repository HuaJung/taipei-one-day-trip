from flask import *
from flask_restful import Resource, Api, fields, marshal_with
from data.db import data_query_one, data_query_all, insert_or_update, data_query_all_dict
import json

app = Flask(__name__)
api = Api(app)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


# Restful
class AttractionPage(Resource):
	def get(self):
		try:
			page = int(request.args.get('page'))
			general_query = "SELECT a.id AS ID, a.origin_id AS id, a.name, c.category, a.description, a.address, a.transport, m.mrt, a.lat, a.lng " \
						 "FROM attractions AS a INNER JOIN categories c ON a.cat_id=c.id INNER JOIN mrt m ON a.mrt_id=m.id"
			page_query = ' ORDER BY a.id LIMIT %s OFFSET %s'
			image_query = 'SELECT image FROM images WHERE att_id=%s'
			att_keyword = request.args.get('keyword')
			items_per_page = 12

			if att_keyword:
				search_query = general_query + " WHERE category LIKE %s OR name LIKE %s"
				search_result = data_query_all_dict(search_query, (att_keyword, '%{}%'.format(att_keyword)))
				search_page = [j for j in range(len(search_result) // 12 + 1)]
				if page in search_page:
					offset = [x * 12 for x in search_page]
					search_query = search_query + page_query
					results = data_query_all_dict(search_query, (att_keyword, '%{}%'.format(att_keyword), items_per_page, offset[page]))
					for result in results:
						image_lst = data_query_all(image_query, (result['ID'],))
						image_lst = [i[0] for i in image_lst]
						result['images'] = image_lst
					next_page = page + 1 if page+1 < len(search_page) else None
					return jsonify(nextPage=next_page, data=results)
				else:
					return jsonify(nextPage=None, data=[])

			data_count = data_query_all('SELECT COUNT(%s) FROM attractions', ('*',))
			total_pages = [i for i in range(data_count[0][0] // 12 + 1)]
			if page in total_pages:
				offset = [x * 12 for x in total_pages]
				general_query = general_query + page_query
				results = data_query_all_dict(general_query, (items_per_page, offset[page]))
				for result in results:
					image_lst = data_query_all(image_query, (result['ID'],))
					image_lst = [i[0] for i in image_lst]
					result['images'] = image_lst
					del result['ID']
				next_page = page + 1 if page+1 < len(total_pages) else None
				return jsonify(nextPage=next_page, data=results)
			else:
				return jsonify(nextPage=None, data=[])
		except:
			return make_response(jsonify(error=True, message='page N/A'), 500)


class AttractionID(Resource):
	def get(self, att_id):
		id_query = "SELECT * FROM attractions WHERE origin_id=%s"
		image_query = 'SELECT image FROM images WHERE att_id=%s'
		try:
			if data_query_all(id_query, (att_id,)):
				att_query = "SELECT a.id AS ID, a.origin_id AS id, a.name, c.category, a.description, a.address, a.transport, m.mrt, a.lat, a.lng " \
							"FROM ({}) AS a INNER JOIN categories c ON a.cat_id=c.id INNER JOIN mrt m ON a.mrt_id=m.id "
				result = data_query_all_dict(att_query.format(id_query), (att_id,))[0]
				image_lst = data_query_all(image_query, (result['ID'],))
				image_lst = [i[0] for i in image_lst]
				result['images'] = image_lst
				del result['ID']
				return jsonify(data=result)
			else:
				return make_response(jsonify(error=True, message='wrong id'), 400)
		except:
			return make_response(jsonify(error=True, message='Internal Server Error'), 500)


class Category(Resource):
	def get(self):
		category_query = 'SELECT category FROM categories'
		try:
			categories = data_query_all(category_query, ())
			categories = [i[0] for i in categories]
			return jsonify(data=categories)
		except:
			return make_response(jsonify(error=True, message='Internal Server Error'), 500)


api.add_resource(AttractionPage, '/api/attractions')
api.add_resource(AttractionID, '/api/attractions/<int:att_id>')
api.add_resource(Category, '/api/categories')

app.run(host='0.0.0.0', port=3000)