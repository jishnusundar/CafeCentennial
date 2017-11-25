//require these modules for user models
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new Schema({
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
     trim: true, //string only
     required: 'Email is required' //message to flash box 
 }
},
{
 collection: "users"
});


let options = ({missingPasswordError: "Wrong Password"}); 

UserSchema.plugin(passportLocalMongoose, options); //attach passport local mongoose to schema with the option created above

exports.User = mongoose.model('User', UserSchema); //user imported from the actual model is exported outside