let mongoose = require('mongoose');
let passport = require('passport');

//define the user model
/*let UserModel = require('../models/users')
let User = UserModel.User;
*/
module.exports.displayLogin = (req,res,next) => {
  return res.render('index/login',{
title:'Login',
/*messages: req.flash('loginMessage'),
        user:req.user?req.user.username:''*/
  });
}


