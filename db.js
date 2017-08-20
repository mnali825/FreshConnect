var mongoose = require('mongoose');//, 
    //URLSlugs = require('mongoose-url-slugs');
var passportLocalMongoose = require('passport-local-mongoose');

var Produce = new mongoose.Schema({
  title:String,
  price:Number,
  type:String,
  image:String,
  amount:Number,
  total:Number
});

var Special = new mongoose.Schema({
  items: [Produce],
  price:Number
});

var Cart = new mongoose.Schema({
  items:[Produce],
  specials:[Special],
  total:Number
});

var User = new mongoose.Schema({
  username:String,
  password:String,
  fname:String,
  lname:String,
  cart:Cart,
  produce:[Produce],
  specials:[Special],
  type:String
});

//ImagePost.plugin(URLSlugs('title images'));
User.plugin(passportLocalMongoose);

mongoose.model('User', User)
mongoose.model('Produce', Produce);
mongoose.model('Specials', Special);
mongoose.model('Cart', Cart);


//mongoose.connect('mongodb://localhost/fcnj');

// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
 
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/mna271';
}

mongoose.connect(dbconf);