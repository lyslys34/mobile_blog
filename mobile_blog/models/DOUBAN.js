var mongodb = require("./db");

DOUBAN = {};

module.exports = DOUBAN;

DOUBAN.get = function(name, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('doubanData', function(err, collection) {
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
