
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings');

var flash = require('connect-flash');
var partials = require('express-partials');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
}));
app.use(flash());


app.use(function(req, res, next){
	  var error = req.flash('error');
	  var success = req.flash('success');
	  console.info("error:", error);
	  console.info('success:', success);
	  res.locals.user = req.session.user;
	  res.locals.error = error.length ? error : null;
	  res.locals.success = success.length ? success : null;
	  next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Add the related routes
app.get('/', routes.index);
app.get('/mobile', routes.mobile);
app.get('/users', user.list);
app.get('/u/:user', routes.user);
app.post('/post', routes.checkLogin);
app.post('/post', routes.post);
app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);
app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);
app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);

// Oopen a web server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
