app.post('/',(req,res,next)=>{
if(req.body.emailId==null)
{
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
              messages: 'Username incorrect or account not registered',
            
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
    if(!regex.test(req.body.emailId))
  {
    //if email id not a valid centennial id
    console.log("Not a valid email");
return res.render('index/login', {
            title: 'Try Again',
              messages: 'Enter a Centennial email ID',
              user:req.user?req.user.username:''
            
          });
  }
  else{
      //if email id is centennial id
      User.register(
    new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.emailId,
        
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
              user:req.user?req.user.username:''
            
          });
        }
        // if registration is successful,authenticate user
        return passport.authenticate('local')(req, res, ()=>{
            console.log("Registration Successful");
           res.redirect('/home');
        });
      });
  }
}
});