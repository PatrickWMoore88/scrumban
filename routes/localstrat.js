const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const accountRouter = require("./routes/localstrat");
require("dotenv").config();

var salt = process.env.SALT_KEY;

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
    // unset: "destroy"
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  console.log(req.method, req.path);
  next();
});

function encryptionPassword(password) {
  var key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, "sha256");
  var hash = key.toString("hex");
  return hash;
}

// app.get("/success", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.send("Welcome " + req.user.name + " You Have Logged In!");
//   } else {
//     res.send("Not Authorized!");
//   }
// });
// app.get("/error", (req, res) => {
//   res.send("Error Please Try Again");
// });

passport.serializeUser(function(user, done) {
  done(null, user.dataValues.id);
});

passport.deserializeUser(function(id, done) {
  models.user.findOne({ where: { id: id } }).then(function(user) {
    done(null, user.dataValues.id);
  });
});

// Passport Local Authentication
const localStrategy = require("passport-local").Strategy;
passport.use(
  new localStrategy(function(name, password, done) {
    console.log("local strat");
    models.user
      .findOne({
        where: {
          name: name
        }
      })
      .then(function(user) {
        console.log(user);
        if (!user) {
          return done(null, false);
        }
        if (user.password != encryptionPassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      })
      .catch(function(err) {
        return done(err);
      });
  })
);
