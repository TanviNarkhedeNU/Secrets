//jshint esversion:6
require("dotenv").config();

const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();
const ejs = require("ejs");
const md5 = require("md5")
const brcypt = require("brcypt");
const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

console.log(process.env.SECRET);//to print the content in .env

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});//to connect mongoose to mongoDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//const secret = "Thisisourlittlesecret!"; this will go to .env
const User = new mongoose.model("User", userSchema);//And now we can use our userSchema to set up a new user model. So it's going to be a new mongoose.model and then we have to specify the name of our collection which is also going to be User in the singular form with a capital U and it's going to be created using that userSchema that we made just there. So now we can start creating users and adding it to this userDB.

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash// this is for storinh "hash" in your db
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      };
    });
    // Store hash in your password DB.
});

});
app.post("/login", function(req, res){
  const userName  = req.body.username;
  const passWord = req.body.password;
  User.findOne({email: userName}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(passWord, foundUser.password, function(err, result){
          if(result === true){
            res.render("secrets");

          }

        });
      }
    }
  });
});



app.listen(3000, function(){
  console.log("Server is running");
})
