const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
var localStorage = require("localstorage");

//for login
module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      localStrategy = true;
      const connection = require('../app');
      connection.execute('select `email`,`username`,password from `cust` where `email` = ? or `username` = ?',[email,email], function(
        err,
        result,
        fields
      ) {
        console.log("resultds:" + JSON.stringify(result));
        if (err) console.log(err);
        else if (!JSON.stringify(result).trim()) {
          console.log("email or username is not valid/registred...");
          return done(null, false, {
            message: "email or username is not valid/registred..."
          });
        } else {
          //  Match password
          bcrypt.compare(password, result[0].password, (err, isMatch) => {
           console.log('pass : ',result[0].password,'\n given pass :'+password);
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              console.log("password matched...");
              //set profileId for current user session
              return done(null, result);
            } else {
              console.log("password incorrect...");
              return done(null, false, { message: "Password incorrect" });
            }
          });
          //ser/desers
          passport.serializeUser((result, done) => {
            done(null, result[0].email);
          });

          passport.deserializeUser((email, done) => {
            connection.execute('select `email` from `cust` where `email` = ?',[email], function(err, result) {
              if (err) {
                console.log("Errr;r:" + err);
              }
              done(err, result[0]);
            });
          });
          // passport.serializeUser(function(result, done) {
          //   done(null, result);
          // });

          // passport.deserializeUser(function(result, done) {
          //   done(null, result);
          // });
        }
      });
    })
  );
};
