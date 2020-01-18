const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const accountRouter = require("./routes/googlestrat");
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  models.user.findOne({ where: { id: id } }).then(function(user) {
    done(null, user);
  });
});

var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// Passport GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    (accesstoken, tokenSecret, profile, done) => {
      models.user
        .findOrCreate({
          where: {
            googleid: profile.id,
            display_name: profile.displayName,
            name: profile.displayName
          }
        })
        .then(user => {
          console.log(user[0].dataValues);
          console.log(
            "User Has Been Found/Created: " + user[0].dataValues.display_name
          );
          done(null, user);
        });
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"]
  }),
  (res, req) => {}
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    var display_name = req.user[0].dataValues.display_name;
    res.render("./account/dashboard", { display_name: display_name });
  }
);
