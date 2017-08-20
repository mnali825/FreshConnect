var express = require('express');
var router = express.Router();
require('../db.js');
var mongoose = require('mongoose');
var Produce = mongoose.model('Produce');
var Special = mongoose.model('Specials');
var passport = require('passport');
var User = mongoose.model('User');
var Cart = mongoose.model('Cart');

//got this code from stackexchange - http://codereview.stackexchange.com/questions/77614/capitalize-the-first-character-of-all-words-even-when-following-a
String.prototype.capitalize = function(){
  return this.toLowerCase().replace( /\b\w/g, function (m) {
    return m.toUpperCase();
    });
  };

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.query.search === undefined || req.query.search === '') {
    Produce.find(function(err, produce, count) {
      //console.log(err);
      // console.log(produce);
      // console.log(req.query.search);
      res.render('index', {produce:produce});
    });
   } else {
    var search = req.query.search;
    search = search.capitalize();
    console.log(search);
    Produce.find({'title':search}, function(err, produce, count) {
      // console.log(produce);
      // console.log(req.query.search);
      res.render('index', {produce:produce});
    });
  }
});

router.get('/admin', function(req, res, next) {
  if (req.user) {
    res.render('admin', {user:req.user});  
  } else {
    res.redirect('/')
  }
  
});

router.post('/admin', function(req, res, next) {
  var title = req.body['title'].toLowerCase();
  var username = req.body['username'];

  var veggie = new Produce({
    title: req.body['title'].capitalize(),
    price: req.body['price'],
    type: req.body['type'].capitalize()
  });

  User.findOne({username:username}, function(err, user) {
    user.produce.push(veggie);
    user.save(function(err, user) {
      console.log(user);
    })
  });

  veggie.save(function(err,veggie, count) {
    console.log(veggie);
    var message = '';
    if (!err) {
      message = 'added successfully';
    } else {
      message = 'something went wrong';
    }
    res.render('admin', {message:message});
  });
});


router.get('/fruits', function(req, res, next) {
  Produce.find({'type':'Fruit'}, function(err, fruit, count) {
    res.render('index', {produce:fruit});
  });
});

router.get('/vegetables', function(req, res, next) {
  Produce.find({'type':'Vegetable'}, function(err, vege, count) {
    res.render('index', {produce:vege});
  });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.post('/login', function(req,res,next) {
  // NOTE: use the custom version of authenticate so that we can
  // react to the authentication result... and so that we can
  // propagate an error back to the frontend without using flash
  // messages
  passport.authenticate('local', function(err,user) {
    if(user) {
      // NOTE: using this version of authenticate requires us to
      // call login manually
      req.logIn(user, function(err) {
        if(user.type == "farmer") {
          res.redirect('/users/'+user.username);  
        } else {
          res.redirect('/');
        }
        
      });
    } else {
      res.render('login', {message:'Your login or password is incorrect.'});
    }
  })(req, res, next);
  // NOTE: notice that this form of authenticate returns a function that
  // we call immediately! See custom callback section of docs:
  // http://passportjs.org/guide/authenticate/
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/register', function(req, res) {
  User.register(new User({username:req.body.username, fname:req.body.fname, lname:req.body.lname, type:"consumer"}), 
    req.body.password, function(err, user){
    if (err) {
      // NOTE: error? send message back to registration...
      res.render('register',{message:'Your username or password is already taken'});
    } else {
      var cart = new Cart({
        items:[],
        specials:[],
        total:0
      });
      user.cart = cart;
      user.save();
      // NOTE: once you've registered, you should be logged in automatically
      // ...so call authenticate if there's no error
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  });   
});

router.get('/uXb924_pgp24x17', function(req,res){
  res.render('register-farmer');
});

router.post('/uXb924_pgp24x17', function(req, res) {
  User.register(new User({username:req.body.username, fname:req.body.fname, lname:req.body.lname, type:"farmer"}), 
    req.body.password, function(err, user){
    if (err) {
      // NOTE: error? send message back to registration...
      res.render('register-farmer',{message:'Your username or password is already taken'});
    } else {
      // NOTE: once you've registered, you should be logged in automatically
      // ...so call authenticate if there's no error
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  });
});

router.get('/users/:username', function(req, res) {
  // NOTE: use populate() to retrieve related documents and 
  // embed them.... notice the call to exec, which executes
  // the query:
  // - http://mongoosejs.com/docs/api.html#query_Query-populate
  // - http://mongoosejs.com/docs/api.html#query_Query-exec
  User
    .findOne({username: req.params.username})
    .populate('images').exec(function(err, user) {
    // NOTE: this allows us to conditionally show a form based
    // on whether or not they're on "their page" and if they're
    // logged in:
    //
    // - is req.user populated (yes means they're logged in and we 
    // have a user
    // - is the authenticated user the same as the user that we
    // retireved by looking at the slug?
    
    // var showForm = !!req.user && req.user.username == user.username;
    if (user.type == 'farmer') {
      res.render('farmer')
    } else {
      res.render('user');
    }
  });
});

router.get('/faq', function(req,res) {
  res.render('faq');
});

router.post('/api/addToCart', function(req,res) {
  if (req.user) {
    var id = req.body['id'];
    var amount = req.body['amount'];
    var total = req.body['total'];
    console.log(total)
    User.findOne({username:req.user.username}, function(err,user) {
      Produce.findOne({_id:id}, function(err, produce) {
        produce.amount = amount;
        produce.total = total;
        user.cart.items.push(produce);
        user.save(function(err,user) {
          console.log(user);
        });
      });
    });  
  } else {
    res.redirect('/')
  }
  
});

router.get('/cart', function(req,res) {
  res.render('cart', {user:req.user});
});


module.exports = router;
