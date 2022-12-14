from flask import *
from tour.models.db_sql import *
from tour.extensions import *

attraction_api = Blueprint('attraction_api', __name__)


class AttractionPage(Resource):
	def get(self):
		try:
			page = int(request.args.get('page'))
			general_query = "SELECT a.id, a.name, c.category, a.description, a.address, a.transport, m.mrt, a.lat, " \
							"a.lng, (SELECT GROUP_CONCAT(i.image) FROM images i WHERE i.att_id=a.id " \
							"GROUP BY i.att_id) AS images FROM attractions a INNER JOIN categories c ON cat_id=c.id " \
							"INNER JOIN mrt m ON mrt_id=m.id"
			page_query = " ORDER BY a.id LIMIT %s OFFSET %s"
			att_keyword = request.args.get('keyword')
			items_per_page = 12

			if att_keyword and page >= 0:
				search_query = "SELECT COUNT(a.id) FROM attractions AS a INNER JOIN categories c ON a.cat_id=c.id" \
							   " WHERE c.category LIKE %s OR a.name LIKE %s"
				search_count = data_query_one(search_query, (att_keyword, '%{}%'.format(att_keyword)))
				search_pages = search_count[0] / 12
				search_pages = int(search_pages) + 1 if search_pages is not int else search_pages
				search_pages_lst = [j for j in range(search_pages)]
				if page in search_pages_lst:
					offset = [x * 12 for x in search_pages_lst]
					search_query = general_query + ' WHERE c.category LIKE %s OR a.name LIKE %s' + page_query
					results = data_query_all_dict(search_query, (att_keyword, '%{}%'.format(att_keyword), items_per_page, offset[page]))
					for result in results:  # convert images string into list
						result['images'] = result['images'].split(',')
					next_page = page + 1 if page+1 < len(search_pages_lst) else None
					return jsonify(nextPage=next_page, data=results)
			elif page >= 0:
				data_count = data_query_all('SELECT COUNT(%s) FROM attractions', ('id',))
				pages_count = data_count[0][0] / 12
				pages_count = int(pages_count) + 1 if pages_count is not int else pages_count
				total_pages_lst = [i for i in range(pages_count)]
				if page in total_pages_lst:
					offset = [x * 12 for x in total_pages_lst]
					general_query = general_query + page_query
					results = data_query_all_dict(general_query, (items_per_page, offset[page]))
					for result in results:  # convert images string into list
						result['images'] = result['images'].split(',')
					next_page = page + 1 if page+1 < len(total_pages_lst) else None
					return jsonify(nextPage=next_page, data=results)
			return jsonify(nextPage=None, data=[])
		except KeyError:
			return make_response(jsonify(error=True, message='Internal Server Error'), 500)


class AttractionID(Resource):
	def get(self, att_id):
		id_query = "SELECT id FROM attractions WHERE id=%s"
		try:
			if data_query_one(id_query, (att_id,)):
				general_query = "SELECT a.id, a.name, c.category, a.description, a.address, a.transport, m.mrt, a.lat, " \
								"a.lng, (SELECT GROUP_CONCAT(i.image) FROM images i WHERE i.att_id=a.id " \
								"GROUP BY i.att_id) AS images FROM attractions a INNER JOIN categories c ON cat_id=c.id " \
								"INNER JOIN mrt m ON mrt_id=m.id WHERE a.id=%s"
				result = data_query_all_dict(general_query, (att_id,))[0]   # get dict from list [{}]
				result['images'] = result['images'].split(',')   # convert images string into list
				return jsonify(data=result)
			else:
				return make_response(jsonify(error=True, message='wrong id'), 400)
		except KeyError:
			return make_response(jsonify(error=True, message='Internal Server Error'), 500)


class Category(Resource):
	def get(self):
		category_query = 'SELECT category FROM categories'
		try:
			categories = data_query_all(category_query, ())
			categories = [i[0] for i in categories]
			return jsonify(data=categories)
		except KeyError:
			return make_response(jsonify(error=True, message='Internal Server Error'), 500)
