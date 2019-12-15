const express = require("express");
const session = require("express-session");
const passport = require("passport");
// const keys = require("./config/keys");
const bodyParser = require("body-parser");
const app = express();
const flash = require("connect-flash");
const mysql = require('mysql2');
// const authRoutes = require("./routes/auth-routes");
// const profileRoutes = require("./routes/profile-routes");
const login_NormRoutes = require("./routes/loginNormRoutes");

// const fs = require('fs');
const urlencodedParser = bodyParser.urlencoded({
  extended: true
});

// Passport Config
require("./config/passport")(passport);

// set view engine
app.set("view engine", "ejs");

// set up session cookies
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/assets", express.static("assets"));

app.use("/routes", express.static("routes"));

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'customers',
  password: 'karthik11c'
});

app.use(flash());

// Global variables...
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/loginNorm", login_NormRoutes);

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


// create home route
app.get("/", (req, res) => res.render("login_n"));

const PORT = process.env.PORT || 8082;
app.listen(PORT, function() {
  console.log("Example app is listening on localhost port 8082...");
});

module.exports = connection;