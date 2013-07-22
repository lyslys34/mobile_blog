var http = require("http");
var mongodb = require("./db");

var userId = '4329922';
var apikey = '0c51103f45c3d75124f330bdd14b85f3';
var count = 30;
var DBinfoUrl = "http://api.douban.com/v2/book/user/" + 
            userId + "/collections?" + "apikey=" + apikey + 
            "&count=" + count;
var resData = '';

DOUBAN = {};

module.exports = DOUBAN;

DOUBAN.get = function(name, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('DB_data', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			
			var query = {};
			if (name) {
				query.name = name;
			}
			
			collection.find(query).sort({}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				var items = [];
				docs.forEach(function(doc, index) {
					var item = doc;
					items.push(item);
				});
				callback(null, items);
			});
		});
	});
};

DOUBAN.save = function(name, callback) {
	http.get(DBinfoUrl, function(res) {
		// Need clear the data for each DOUBAN request
		resData = "";
		// create the DOUBAN return data
		res.on('data', function(chunk) {
			resData += chunk;
		});
		
		res.on('end', function(data) {
			var resObject = JSON.parse(resData);
			var collections = resObject.collections,
			    length = collections.length,
			    item;
			
			mongodb.open(function(err, db) {
				if (err) {
					return callback(err);
				}
				db.collection('doubanData', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					
					for (var i = 0; i < length; i++) {
						item = collections[i];
						item['_id'] = item.id;
						collection.ensureIndex('_id', {unique: true});
						collection.save(item, {safe: true}, function(err, item) {
							if (err) {
								callback(err);
							}
						});
					}
					mongodb.close();
				});
			});
		});
	});
};
 