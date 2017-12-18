let mongoose = require('mongoose');

// model for Restaurant
let orderSchema = mongoose.Schema({
    userId:String,
    items:[],
    orderType:String,
    singleOrderDate:String,
    singleOrderTime:String,
    mondayAt:String,
    tuesdayAt:String,
    wednesdayAt:String,
    thursdayAt:String,
    fridayAt:String,
    subTotal:String,
    taxes: String,
    grandTotal:String,
    creationDate:String
},
{
  collection: "orders"
});

module.exports = mongoose.model('orders', orderSchema);
