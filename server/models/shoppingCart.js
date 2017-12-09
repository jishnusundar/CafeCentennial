let mongoose = require('mongoose');

// model for Restaurant
let cartSchema = mongoose.Schema({
    userId: String,
    items:[]
},
{
  collection: "shoppingCart"
});

module.exports = mongoose.model('shoppingCart', cartSchema);
