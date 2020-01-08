// Express, Body-Parser, and Encrytion Setup
const express = require("express");
const app = express();
const session = require("express-session");
const models = require("./models");
const bodyParser = require("body-parser");
const pbkdf2 = require("pbkdf2");
const accountRouter = require("./routes/account");
const boardRouter = require("./routes/boards");
const listRouter = require("./routes/lists");
const cardRouter = require("./routes/cards");
require("dotenv").config();

var salt = process.env.SALT_KEY;

app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Kublai Kanban",
    resave: false,
    saveUninitialized: true,
    unset: "destroy"
  })
);
app.use(express.static(__dirname + "/public"));
app.use("/account", accountRouter);
app.use("/boards", boardRouter);
app.use("/lists", listRouter);
app.use("/cards", cardRouter);

app.use(function(req, res, next) {
  console.log(req.method, req.path);
  next();
});

function encryptionPassword(password) {
  var key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, "sha256");
  var hash = key.toString("hex");
  return hash;
}

// Passport Setup
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/success", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("Welcome " + req.user.name + " You Have Logged In!");
  } else {
    res.send("Not Authorized!");
  }
});
app.get("/error", (req, res) => {
  res.send("Error Please Try Again");
});

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  models.user.findOne({ where: { id: id } }).then(function(user) {
    cb(null, user);
  });
});

// Passport Local Authentication
const localStrategy = require("passport-local").Strategy;
passport.use(
  new localStrategy(function(name, password, done) {
    models.user
      .findOne({
        where: {
          name: name
        }
      })
      .then(function(user) {
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

// Passport Github Authentication
const github = require("passport-github").Strategy;
github.use(
  new GitHubStrategy(
    {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://localhost:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      models.user.findOrCreate({ github_id: profile.id }, function(err, user) {
        return done(err, user);
      });
    }
  )
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/", (req, res) => {
  res.render("/home");
});

// Dynamic Port Setting
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("App Listening on Port " + port));
