let mongoose = require('mongoose');

// model for Restaurant
let menuItemSchema = mongoose.Schema({
    itemName: String,
    type: String,
    restaurant: String,
    price :String
},
{
  collection: "menuItems"
});

module.exports = mongoose.model('menuItems', menuItemSchema);
