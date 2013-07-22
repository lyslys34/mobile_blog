var http = require("http");
var mongodb = require("./models/db");

var userId = '4329922';
var apikey = '0c51103f45c3d75124f330bdd14b85f3';
var DBinfoUrl = "http://api.douban.com/v2/book/user/" + userId + "/collections?" + "apikey=" + apikey;
var resData ="";
console.info(DBinfoUrl);
http.get(DBinfoUrl, function (res) {
	//console.info(res);
	res.on('data', function (chunk) {
	    //console.log('BODY: ' + chunk);
	    resData += chunk;
	});
	
	res.on('end', function (data) {
		//console.info("END: ", resData);
		var resObject = JSON.parse(resData);
		console.info("resObject: ", resObject.collections.length);
		var collections = resObject.collections,
		    length = collections.length,
		    item;
		
		mongodb.open(function(err, db){
			if (err) {
				console.info("Open mongodb err:", err);
				return;
			}
			db.collection('DB_data', function(err, collection) {
				if (err) {
					mongodb.close();
					return;
				}
				for (var i = 0; i < length; i++) {
					item = collections[i];
					item['_id'] = item.id;
					collection.ensureIndex('_id', {unique: true});
					collection.save(item, {safe:true}, function(err, item){
						if (err) {
							console.info("Insert item into DB failed err:", err);
						}
						
						console.info("Insert item success. item:", item);
					});
				}
				mongodb.close();
				
			});
		});
		
		
		
	});
});