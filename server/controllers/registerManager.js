let mongoose = require('mongoose');
let passport = require('passport');

let express = require('express');
let app = express.Router();

//define the user model
let ManagerModel = require('../models/restManagers')
let RestManager = ManagerModel.RestManager;

app.get('/',(req,res,next)=>{
    RestManager.register(
        new RestManager({
            username: 'tim-manager',
            password: 'timhortons1234',
            email: 'manager1@timhortons.com',
            restaurantName: 'Tim Hortons'
          }),
          'timhortons1234',
          (err) => {
            if(err) {
              console.log('Error insterting new restaurant manager: '+ err.message);
              if(err.name == 'UserExistsError') {
                req.flash('registerMessage', 'Registration Error: User Already Exists!');
              }
              
            }
            console.log("Restaurant manager registered");
            return res.redirect('/')
          });
})

module.exports = app;