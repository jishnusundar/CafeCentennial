let mongoose = require('mongoose');
let passport = require('passport');

let express = require('express');
let app = express.Router();

//define the user model
let UserModel = require('../models/users')
let User = UserModel.User;

let restaurant = require('../models/restaurants');
let menuItem = require('../models/menuItems');
let shoppingCart = require('../models/shoppingCart');
let order = require('../models/orders');

let moment = require('moment');

function requireAuth(req,res,next) {
  //check if the user is logged in, else prompt to log in
  if(!req.isAuthenticated()) {
    return res.redirect('/');
  }
    next();
}

// Just use app.get to attach view files to a route
//--------------------------------- ROUTERS---------------------------------
app.get('/',(req,res,next) => {
  return res.render('index/login',{
title:'Login',
messages:'',
user:req.user?req.user.username:'',
userCredit:req.user?req.user.creditBalance:'N/A'
  });
});

app.post('/',(req,res,next)=>{
if(req.body.emailId=='')
{
  console.log("Entered here!!")
 //Assume user is existing, check if username exist in records and authenticate
 User.find( {"username":req.body.username},(err, users) => {
    if (err) {
      console.error(err);
    //if error reading DB
    }
    else { // no error reading DB
         if(users.length==0)
     {
         //if username not found in records, DO NOT AUTHENTICATE
         console.log("User Not found")
         return res.render('index/login', {
            title: 'Try Again',
            user:req.user?req.user.username:'',
            messages: 'Username incorrect or account not registered',
            userCredit:req.user?req.user.creditBalance:'N/A'
            
          });
     }
     else
     {
         //if username  found in records,  AUTHENTICATE!!
         return passport.authenticate('local', {
         successRedirect: '/home',
         failureRedirect: '/', 
         failureFlash: true
        })(req,res,next);
     }
    }
 });
}
else //if email id provided, check email valid, register the user and authenticate
{
  var regex = new RegExp("(.+)@my.centennialcollege.ca")
    if(!regex.test(req.body.emailId))
  {
    //if email id not a valid centennial id
    console.log("Not a valid email");
return res.render('index/login', {
            title: 'Try Again',
            messages: 'Enter a Centennial email ID',
            user:req.user?req.user.username:'',
            userCredit:req.user?req.user.creditBalance:'N/A'
          });
  }
  else{
      //if email id is centennial id
      User.register(
    new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.emailId,
        creditBalance:'10'
      }),
      req.body.password,
      (err) => {
        if(err) {
          console.log('Error insterting new user: '+ err.message);
          if(err.name == 'UserExistsError') {
            req.flash('registerMessage', 'Registration Error: User Already Exists!');
          }
          return res.render('index/login', {
            title: 'Try Again',
            messages: req.flash('registerMessage'),
            user:req.user?req.user.username:'',
            userCredit:req.user?req.user.creditBalance:'N/A'
          });
        }
        // if registration is successful, authenticate user and create a shopping cart for the user
        return passport.authenticate('local')(req, res, ()=>{
            console.log("Registration Successful");
            //create shopping cart
            console.log("Creating shopping cart");
            let newCart = {
              userId: req.user._id,
              items: []
            }

            shoppingCart.create(newCart, (err, resp) => {

     if(err) {
        console.log("ERROR creating shopping Cart!!!: "+err);
       res.end(err);
      } else {
          res.redirect('/home');
      }
    });

           
        });
      });
  }
}
});

app.get('/logout',(req,res,next)=> {
    req.logout();
    res.redirect('/'); //redirect to home page
})

app.get('/home',requireAuth,(req,res,next) => {

restaurant.find((err, restaurants) => {
    if (err) {
      return console.error(err);
    }
    else {
     return res.render('index/home',{
        title:'Welcome Online',
        user:req.user?req.user.username:'',
        restaurants: restaurants,
        userCredit:req.user?req.user.creditBalance:'N/A',
        message:''
    });
    }
  });

 
});

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ROUTERS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

app.get('/restaurant/:restaurantName',(req,res,next) => {

menuItem.find({"restaurant":req.params.restaurantName},(err, items) => {
    if (err) {
      return console.error(err);
    }
    else {
     return res.render('index/restaurant',{
        title:'Welcome Online',
        user:req.user?req.user.username:'',
        items: items,
        restaurant:req.params.restaurantName,
        userCredit:req.user?req.user.creditBalance:'N/A'
    });
    }
  });

});

app.get('/checkout',(req,res,next) => {
  return res.render('index/checkout',{
   title:'Checkout',
   user:req.user?req.user.username:'',
   userCredit:req.user?req.user.creditBalance:'N/A'

  });
});

app.get('/shoppingCart',(req,res,next) => {

  shoppingCart.find({"userId":req.user._id},(err,result)=>{ //get this iser's shopping cart
  if(err)
  {
    console.log("Error finding the shopping cart")
  }
  else
  { //successfully retreived shopping cart
    var items = result[0].items;
    console.log("Cart found")
    return res.render('index/shoppingCart',{
      items:items,
      title:'Add to Cart',
      user:req.user?req.user.username:'',
      userCredit:req.user?req.user.creditBalance:'N/A'
   
     });
    
}
});

  
});

app.post('/confirmCheckout',(req,res,next)=>{
  //console.log("using name"+req.body["itemPrice1"]);
  var itemsOrdered =[];
  var count= req.body.numOfItems;
  var singleOrderDate;
  var singleOrderTime;
  var mondayAt;
  var tuesdayAt;
  var wednesdayAt;
  var thursdayAt;
  var fridayAt;

  var totalPrice = 0;
  for(var i=1; i<=count; i++) 
  {
    var thisPrice = req.body["itemPrice"+i];
    var thisCount  =req.body["itemCount"+i];
    var thisTotal = parseFloat(thisPrice) * parseInt(thisCount);
    var item = {
      itemName:req.body["itemName"+i],
      itemCount:req.body["itemCount"+i],
      itemText: req.body["itemText"+i],
      itemPrice: req.body["itemPrice"+i]
    }
    totalPrice += thisTotal ;
    itemsOrdered.push(item);
  }
  totalPrice = totalPrice.toFixed(2);
  var daysToRepeat=0;
  var orderType = req.body.orderType;
  if(orderType=="single")
  {
    singleOrderDate=req.body.singleOrderDate;
    singleOrderTime = req.body.singleOrderTime;
  }
  else if(orderType=="recurring")
  {
    mondayAt = req.body.mondayAt;
    if(!mondayAt=="")
    {
      daysToRepeat+=1;
    }
    tuesdayAt = req.body.tuesdayAt;
    if(!tuesdayAt=="")
    {
      daysToRepeat+=1;
    }
    wednesdayAt = req.body.wednesdayAt;
    if(!wednesdayAt=="")
    {
      daysToRepeat+=1;
    }
    thursdayAt = req.body.thursdayAt;
    if(!thursdayAt=="")
    {
      daysToRepeat+=1;
    }
    fridayAt = req.body.fridayAt;
    if(!fridayAt=="")
    {
      daysToRepeat+=1;
    }
    console.log("Days to repeat: "+ daysToRepeat);
    totalPrice = totalPrice * parseFloat(daysToRepeat);
    console.log("total price after recurring calculations: "+ totalPrice);
  }
  var order = {
    userId:req.user._id,
    items:itemsOrdered,
    orderType:orderType,
    singleOrderDate:singleOrderDate,
    singleOrderTime:singleOrderTime,
    mondayAt:mondayAt,
    tuesdayAt:tuesdayAt,
    wednesdayAt:wednesdayAt,
    thursdayAt:thursdayAt,
    fridayAt:fridayAt,
    subTotal:totalPrice,
    taxes: (0.13 * totalPrice).toFixed(2),
    grandTotal:(totalPrice *1.13).toFixed(2),
    creationDate:moment().format('MM/DD/YY, h:mm:ss a')
  }
  //console.log(order);
  req.session.pendingOrder=order; //attach this object to session to save to DB after checkout
  
  return res.render('index/checkout',{
    title:'Checkout',
    messages:'',
    user:req.user?req.user.username:'',
    order:order,
    userCredit:req.user?req.user.creditBalance:'N/A'
    
      });
});

app.get('/processOrder',(req,res,next)=> {
  //CREATE ORDER IN DB
var pendingOrder = req.session.pendingOrder;
if(parseFloat(req.user.creditBalance) >= parseFloat(pendingOrder.grandTotal)) //user have balance to purchase this
{
  order.create(pendingOrder,(err,result)=>{
    if(err)
    {
      console.log("Error creating order");
    }
    else
    { //order created successfully
      console.log("Order created")
      console.log(result);
      req.session.pendingOrder=null; //clear order from session memory
      
      User.update({"_id":req.user._id},{$set:{creditBalance:(parseFloat(req.user.creditBalance) - parseFloat(pendingOrder.grandTotal)).toFixed(2)}},(err4,result4)=>{
        //Depreciate user's balance
        if (err4)
        {
          console.log("Error depreciated user's balance")
        }
        else
        {
          console.log("User balance depreciated");
        }
      })
      shoppingCart.update({"userId":req.user._id},{ $pull: { items: {} }  },(error3,feedBack2)=>{ //clear shopping cart and take user home
  
        if(error3)
        {
          console.log("Error clearing items from cart");
        }
        else
        {
        console.log(feedBack2);
        console.log("all items cleared from cart");
        restaurant.find((err, restaurants) => { //find all restaurants and render home page
          if (err) {
            return console.error(err);
          }
          else {
           return res.render('index/home',{
              title:'Welcome Online',
              user:req.user?req.user.username:'',
              restaurants: restaurants,
              userCredit:req.user?req.user.creditBalance:'N/A',
              message:'Order placed!'
          });
          }
        });
        }
      });
      
    }
  });
}
else //ask user to add balance to credit
{
  return res.render('index/credits',{
    title:'Credits',
    messages:'',
    user:req.user?req.user.username:'',
    userCredit:req.user?req.user.creditBalance:'N/A',
    creditMessage:'Please reload your credits to place this order',
    balRequired:pendingOrder.grandTotal
    });
}


});

app.get('/clearCartAndCancel',(req,res,next)=>{
  shoppingCart.update({"userId":req.user._id},{ $pull: { items: {} }  },(error3,feedBack2)=>{
   
    if(error3)
    {
      console.log("Error clearing items from cart");
    }
    else
    {
    console.log(feedBack2);
    console.log("all items cleared from cart");
    res.redirect("/home");
    }
  });
});

app.post('/addToCart',(req,res,next)=> {
  console.log(req.body);
  //Find and update the cart

//shoppingCart.find({"userId":req.user._id,"items":{$elemMatch:req.body}},(err,result)=>{
  shoppingCart.find({"userId":req.user._id},(err,result)=>{ //get this iser's shopping cart
  if(err)
  {
    console.log("Error finding the shopping cart")
  }
  else
  { //successfully retreived shopping cart
    var items = result[0].items;
    console.log("Cart found")
    var nodeFound="False";
    var itemToUpdate;
    for(var i=0; i<items.length; i++)
    {
      if(items[i].itemName==req.body.itemName && items[i].price == req.body.price) //if cart already has this item, increment count
      {
        nodeFound="True";
        console.log("Match found")
        console.log(items[i])
        itemToUpdate = items[i];  // now Update cart - Increment Count of this item
      }
    }
    if(nodeFound=="True") //This item already exist in cart, increment the count only
    {
      console.log("Node found = true")
      shoppingCart.update({"userId":req.user._id,"items":itemToUpdate},{ $set: { "items.$" : {"itemName":itemToUpdate.itemName,"price":itemToUpdate.price,"count":itemToUpdate.count+1} } },(error2,feedBack)=>{
        if(error2)
        {
          console.log("Error Incrementing items count");
        }
        else
        {
        console.log(feedBack);
        console.log("Count incremented");
        res.end();
        }
      })
    }
    else // This item does not exist. add this item to cart with count as 1
    {
      console.log("Node found = false")
       shoppingCart.update({"userId":req.user._id},{$push: {items:{"itemName":req.body.itemName,"price":req.body.price,"count":1}}},(err,result)=>{
          if(err)
           {
               console.log("Error adding item for the first time " + err)
           }
           else
          {
             console.log(result);
             console.log("Added for first time");
             res.end();
             }
          });
    }
    res.end();
}
});


  //console.log("posted from jquery")
  
});


app.post('/removeFromCart',(req,res,next)=> {
  console.log("removeFromCart clicked");
console.log(req.body);

shoppingCart.find({"userId":req.user._id},(err,result)=> { //find the user's shopping cart
  if(err) //error finding shopping cart
  {
    console.log("Error finding the shopping cart")
  }
  else //shopping cart found
  {
    var items = result[0].items;
    console.log("Cart found")
    var nodeFound="False";
    var itemToUpdate;
    for(var i=0; i<items.length; i++)
    {
      if(items[i].itemName==req.body.itemName && items[i].price == req.body.price) //if cart already has this item, decrement count
      {
        nodeFound="True";
        console.log("Match found")
        console.log(items[i])
        itemToUpdate = items[i];  // now Update cart - decrement Count of this item
      }
    }
    if(nodeFound=="True") //This item already exist in cart, decrement the count only
    {
      console.log("Node found = true")
      shoppingCart.update({"userId":req.user._id,"items":{$elemMatch:{"itemName":itemToUpdate.itemName,"price":itemToUpdate.price,"count":{$gt:1}}}},{ $set: {"items.$.count" : itemToUpdate.count-1} },(error2,feedBack)=>{
        //decrement the count of items that has count > 1, by 1 Example: count 2 to count 1
        if(error2)
        {
          console.log("Error decrementing items count");
        }
        else
        {
        console.log(feedBack);
        console.log("Count was greater than 1: decremented");
        res.end();
        }
      });

      shoppingCart.update({"userId":req.user._id,"items":{$elemMatch:{"itemName":itemToUpdate.itemName,"price":itemToUpdate.price,"count":1}}},{ $pull: { items: { "itemName":itemToUpdate.itemName,"price":itemToUpdate.price,"count":1 } }  },(error3,feedBack2)=>{
        //remove the item from count that has count 1
        if(error3)
        {
          console.log("Error removing item from cart");
        }
        else
        {
        console.log(feedBack2);
        console.log("item removed from cart");
        res.end();
        }
      });
    }

  }
});
res.end();
});


app.get('/credits',(req,res,next) => {
  return res.render('index/credits',{
  title:'Credits',
  messages:'',
  user:req.user?req.user.username:'',
  userCredit:req.user?req.user.creditBalance:'N/A',
  creditMessage:'',
  balRequired:''
  });
});
  
app.post('/credits',(req,res,next)=>{
  console.log(req.body);
  User.update({"_id":req.user._id},{$set:{"creditBalance":(parseFloat(req.user.creditBalance)+parseFloat(req.body.amount)).toFixed(2)}},(err,result)=>{
    if(err)
    {
      console.log("Error reloading user credit");
    }
    else
    {
      console.log("Credit reloaded successfully");
      return res.render('index/credits',{
        title:'Credits',
        messages:'',
        user:req.user?req.user.username:'',
        userCredit:req.user?req.user.creditBalance:'N/A',
        creditMessage:'Credit reloaded successfully!',
        balRequired:''
        });
    }
  });
}); 

app.get('/orderHistory',(req,res,next) => {

  order.find({"userId":req.user._id},(err,ordersFound)=>{
    if(err)
    {
      console.log("Error fetching orders for this user");
    }
    else
    {
      console.log(ordersFound);
      return res.render('index/orderHistory',{
        title:'Order History',
        messages:'',
        user:req.user?req.user.username:'',
        userCredit:req.user?req.user.creditBalance:'N/A',
        orders:ordersFound
        });
    }
  })

  
});


app.get('/orderDetails/:id',(req,res,next) => {

  order.find({"_id":req.params.id},(err,ordersFound)=>{
    if(err)
    {
      console.log("Error fetching orders for this user");
    }
    else
    {
      console.log(ordersFound);
      var thisOrder = ordersFound[0]
      console.log(thisOrder);
      return res.render('index/orderDetails',{
        title:'Order Details',
        messages:'',
        user:req.user?req.user.username:'',
        userCredit:req.user?req.user.creditBalance:'N/A',
        order:thisOrder
        });
    }
  });

  
});


app.get('/recurringOrder',(req,res,next) => {

        return res.render('index/recurringOrder',{
        title:'Order Details',
        messages:'',
        user:req.user?req.user.username:'',
        userCredit:req.user?req.user.creditBalance:'N/A'
        });

  });

  app.get('/storeDashboard',(req,res,next) => {
    
            return res.render('index/storeDashboard',{
            title:'Store Dashboard',
            messages:'',
            user:req.user?req.user.username:'',
            userCredit:req.user?req.user.creditBalance:'N/A'
            });
    
      });
module.exports = app;



