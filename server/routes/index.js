let express = require('express');
let router = express.Router();
let indexController = require('../controllers/index');

let mongoose = require('mongoose');
let passport = require('passport');

/*//define the user model
let UserModel = require('../models/users')
let User = UserModel.User;

let survey = require('../models/surveys');


*/
//Get the home page and render the login form


router.get('/',(req,res,next) => {

indexController.displayLogin(req,res,next);

   
});



module.exports = router;