//jshint esversion:6
require("dotenv").config();

const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passLocalMongoose = require("passport-local-mongoose")
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//console.log(process.env.SECRET);//to print the content in .env
app.use(session({
  secret: "Our little secret!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});//to connect mongoose to mongoDB
//mongoose.set("userCreateIndex", true);
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passLocalMongoose);

//const secret = "Thisisourlittlesecret!"; this will go to .env
const User = new mongoose.model("User", userSchema);//And now we can use our userSchema to set up a new user model. So it's going to be a new mongoose.model and then we have to specify the name of our collection which is also going to be User in the singular form with a capital U and it's going to be created using that userSchema that we made just there. So now we can start creating users and adding it to this userDB.
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){//if the user has not logged out, then provide the secrets page else the login page
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});
app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log("err");
    } else{
      passport.authenticate("local")(req, res, function(){//type of authentication is local
        res.redirect("/secrets")
      })
    }
  })

});


app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
 req.login(user, function(err){
   if(err){
     console.log(err);
   }else{
     passport.authenticate("local")(req, res, function(){
       res.redirect("/secrets");
     });
   }
 })
});

app.listen(3000, function(){
  console.log("Server is running");
});
