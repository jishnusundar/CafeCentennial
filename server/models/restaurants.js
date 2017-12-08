let mongoose = require('mongoose');

// model for Restaurant
let restaurantSchema = mongoose.Schema({
    name: String,
    operatingHours: String
},
{
  collection: "restaurants"
});

module.exports = mongoose.model('restaurants', restaurantSchema);
