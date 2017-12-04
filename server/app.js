
// include all of our middleware
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

//modules for authentication
let session = require("express-session");
let passport = require("passport");
let passportlocal = require("passport-local");
let Localstrategy = passportlocal.Strategy;
let flash = require("connect-flash"); //display errors/login messages

// import "mongoose"
let mongoose = require('mongoose');

// URI
let config = require('./config/db');

mongoose.connect(process.env.URI || config.URI);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("Conneced to MongoDB...");
});

// define controllers
let indexController = require('./controllers/index'); // top level routes



let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//app.use(favicon(path.join(__dirname, '../client','icon.jpg')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

//setup session
app.use(session({
secret: "SomeSecret",
saveUninitialized: true,
resave: true
}));

//initialize passport and flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// redirect incoming requests routes to appropriate controllers
app.use('/', indexController);

//Passport User Configuration
let UserModel = require('./models/users')
let User = UserModel.User; //'User' from the export statement in the models/users.js
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Handle 404 Errors
  app.use(function(req, res) {
      res.status(400);
     res.render('errors/404',{
      title: '404: File Not Found',
      
    });
  });

  // Handle 500 Errors
  app.use(function(error, req, res, next) {
      res.status(500);
      res.render('errors/500', {
        title:'500: Internal Server Error',
        error: error,
        
      });
  });



module.exports = app;
