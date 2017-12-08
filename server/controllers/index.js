let mongoose = require('mongoose');
let passport = require('passport');

let express = require('express');
let app = express.Router();

//define the user model
let UserModel = require('../models/users')
let User = UserModel.User;

function requireAuth(req,res,next) {
  //check if the user is logged in, else prompt to log in
  if(!req.isAuthenticated()) {
    return res.redirect('/');
  }
    next();
}

// Just use app.get to attach view files to a route
//--------------------------------- ROUTERS---------------------------------
app.get('/',(req,res,next) => {
  return res.render('index/login',{
title:'Login',
messages:''
  });
});

app.post('/',(req,res,next)=>{
if(req.body.emailId=='')
{
  console.log("Entered here!!")
 //Assume user is existing, check if username exist in records and authenticate
 User.find( {"username":req.body.username},(err, users) => {
    if (err) {
      console.error(err);
    //if error reading DB
    }
    else { // no error reading DB
         if(users.length==0)
     {
         //if username not found in records, DO NOT AUTHENTICATE
         console.log("User Not found")
         return res.render('index/login', {
            title: 'Try Again',
              messages: 'Username incorrect or account not registered',
            
          });
     }
     else
     {
         //if username  found in records,  AUTHENTICATE!!
         return passport.authenticate('local', {
         successRedirect: '/home',
         failureRedirect: '/', 
         failureFlash: true
        })(req,res,next);
     }
    }
 });
}
else //if email id provided, check email valid, register the user and authenticate
{
  var regex = new RegExp("(.+)@my.centennialcollege.ca")
    if(!regex.test(req.body.emailId))
  {
    //if email id not a valid centennial id
    console.log("Not a valid email");
return res.render('index/login', {
            title: 'Try Again',
              messages: 'Enter a Centennial email ID',
             
            
          });
  }
  else{
      //if email id is centennial id
      User.register(
    new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.emailId,
        
      }),
      req.body.password,
      (err) => {
        if(err) {
          console.log('Error insterting new user: '+ err.message);
          if(err.name == 'UserExistsError') {
            req.flash('registerMessage', 'Registration Error: User Already Exists!');
          }
          return res.render('index/login', {
            title: 'Try Again',
              messages: req.flash('registerMessage'),
              user:req.user?req.user.username:''
            
          });
        }
        // if registration is successful,authenticate user
        return passport.authenticate('local')(req, res, ()=>{
            console.log("Registration Successful");
           res.redirect('/home');
        });
      });
  }
}
});

app.get('/logout',(req,res,next)=> {
    req.logout();
    res.redirect('/'); //redirect to home page
})

app.get('/home',requireAuth,(req,res,next) => {
return res.render('index/home',{
title:'Welcome To CafeCentennial',
  }); 
});

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ROUTERS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

app.get('/restaurant',(req,res,next) => {
  return res.render('index/restaurant',{
   title:'Restaurant',
  });
});

app.get('/checkout',(req,res,next) => {
  return res.render('index/checkout',{
   title:'Checkout',
  });
});

app.get('/addToCart',(req,res,next) => {
  return res.render('index/addToCart',{
   title:'Add to Cart',
  });
});

module.exports = app;