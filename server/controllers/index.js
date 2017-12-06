let mongoose = require('mongoose');
let passport = require('passport');

let express = require('express');
let app = express.Router();



// Just use app.get to attach view files to a route
//--------------------------------- ROUTERS---------------------------------
app.get('/',(req,res,next) => {
  return res.render('index/login',{
title:'Login',
  });
});


app.get('/home',(req,res,next) => {
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