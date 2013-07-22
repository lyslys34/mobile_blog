
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var DOUBAN = require('../models/DOUBAN');

exports.mobile = function(req, res) {
	DOUBAN.get(null, function(err, items) {
		if (err) {
			items = [];
		}
		console.info("DOUBAN data length:", items.length);
		res.render('mobile', {
			title: "Mobile",
			layout: null,
			items: items
		});
	});
	
};

exports.doMobile = function(req, res) {
	DOUBAN.get(null, function(err, items) {
		if (err) {
			items = [];
		}
		res.json({
			DBItems: items
		});
	});
	
};

exports.index = function(req, res){
    Post.get(null, function(err, posts) {
    	if (err) {
    		posts = [];
    	}
        res.render('index', {
        	title: "Home",
        	posts: posts
        });
    });
};

exports.user = function(req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', 'User not exist');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			console.info("User get the posts:", posts);
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
		    res.render('user', {
		    	title: user.name,
		    	posts: posts,
		    	layout: 'layout'
		    });
		});
	});
};

exports.post = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', 'Post Blog successfully');
		res.redirect('/u/' + currentUser.name);
	});
};

exports.reg = function(req, res) {
	res.render('reg', {
		title: "User Register"
	});
};

exports.doReg = function(req, res) {
	// check the password and password-repest is the same
	if (req.body['password-repeat'] !== req.body['password']) {
		req.flash('error', 'the two password is not the same');
		return res.redirect('/reg');
	}
	
	// Create the hash for the password
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	
	var newUser = new User({
		name: req.body.username,
		password: password
	});
	
	// Check the username had already existed or not
	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'Username already exists.';
		}
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		
		// If not, create a new user
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', 'register sucessfully');
			res.redirect('/');
		});
	});
};

exports.login = function(req, res) {
	res.render('login', {
		title: 'User Login'
	});
};

exports.doLogin = function(req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	
	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', "User not exist");
			return res.redirect('/login');
		}
		console.info("user.password:", user.password);
		console.info("password:", password);
		
		if (user.password !== password) {
			req.flash('error', "User Password is wrong!");
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', 'Login Successfully');
		res.redirect('/');
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', 'Logout Successfully');
	res.redirect('/');
};

exports.checkLogin = function(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Not Login');
		return res.redirect('/login');
	}
	next();
};

exports.checkNotLogin = function(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'Had already Login');
		return res.redirect('/');
	}
	next();
};