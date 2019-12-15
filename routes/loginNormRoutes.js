const router = require("express").Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const connection = require('../app');
// var multer  = require('multer');
// var path = require('path');
// var localStorage =  require('localstorage');
// var mkdirp = require('mkdirp');
// let fs = require('fs-extra');
// var async = require('async');
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const { ensureAuthenticated } = require("../config/auth");
router.use(bodyParser.json());

// 1.1 ********** UI - register button register page **************
router.get("/register", (req, res) => res.render("register"));

//1.2f ************ UI - register/submit button after filling data *************
router.post("/register", (req, res) => {
  console.log("reqBody:" + JSON.stringify(req.body));
  const {
    firstname,
    lastname,
    email,
    username,
    password,
    password2
  } = req.body;

  let errors = [];

  if (
    !firstname ||
    !lastname ||
    !email ||
    !username ||
    !password ||
    !password2
  ) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }
  //if errors..
  if (errors.length > 0) {
    res.render("register", {
      errors,
      firstname,
      lastname,
      email,
      username,
      password,
      password2
    });
  }
  //if all details are entered(if none of the field is empty)...
  else {
    const connection = require('../app');
    connection.execute('select `email`,`username` from `cust` where `email` = ? or `username` = ?',[email,username],(err,result,fields)=>{
       if(err) console.log('Error due to : '+err);
       else{
                  console.log("reswithor:" + JSON.stringify(result));
                  if (err) {
                    console.log(err);
                  } else if (!JSON.stringify(result[0])) {
                    //email and username both are unique...
          bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              var enc_pass = hash;
              console.log("firstname:" + firstname);
                connection.execute('insert into `cust` values(?,?,?,?,?)',[firstname,lastname,email,username,enc_pass],function(err,result,fields) {
                  if (err) throw err;
                  req.flash(
                    "success_msg",
                    "You are now registered and can log in"
                  );
                  res.redirect("/loginNorm/login");
                });
              });
            });
              }else if(JSON.stringify(result[0].email)){
                      //email already exist
                          errors.push({
                            msg: "Email is already RegisterED..PLease TRy Another ONe..."
                          });
                          renderErrors();
                  }else if(JSON.stringify(result[0].username)){
                    //username exist
                    errors.push({
                      msg: "USername must be UNique..."
                    });
                    renderErrors();
                  }
       }
    });
          }
        });

  function renderErrors() {
    res.render("register", {
      errors,
      firstname,
      lastname,
      email,
      username,
      password,
      password2
    });
  }
//2.1 ********  UI - login button/failerredirect button i.e. if login fails then redirect to same page *********
router.get("/login", (req, res) => res.render("login_n"));

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/loginNorm/login");
});
//2.2 ******* UI - login/submit after filling data ie. check if user registred or not...
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/loginNorm/loginSuccess", //redirecting to dashboard if user is instructor...
    failureRedirect: "/loginNorm/login",
    failureFlash: true
  })(req, res, next);
});

//2.3 **** if login successull
router.get("/loginSuccess", function(req, res) {
  res.render("home", { name: "Team" });
});

module.exports = router;
