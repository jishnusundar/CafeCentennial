//require these modules for user models
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let passportLocalMongoose = require("passport-local-mongoose");

let RestManagerSchema = new Schema({
 username: {
     type: String,
     default: '',
     trim: true, //string only
     required: 'Display Name is required' //message to flash box 
 },
 
  password: {
     type: String,
     default: '',
     trim: true, //string only
     required: 'Password is required' //message to flash box 
 }, 
 email: {
     type: String,
     default: '',
     trim: true, //string only,
     required: 'A valid Centennial domain e-mail is required' //message to flash box 
 },
 restaurantName: {
     type:String
 }
},
{
 collection: "restManagers"
});


let options = ({missingPasswordError: "Wrong Password"}); 

RestManagerSchema.plugin(passportLocalMongoose, options); //attach passport local mongoose to schema with the option created above

exports.RestManager = mongoose.model('restManagers', RestManagerSchema); //user imported from the actual model is exported outside