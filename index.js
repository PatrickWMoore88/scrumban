// Express, Body-Parser, and Encrytion Setup
const express = require("express");
const app = express();
const session = require("express-session");
const models = require("./models");
const bodyParser = require("body-parser");
const pbkdf2 = require("pbkdf2");
const passport = require("passport");
const accountRouter = require("./routes/account");
const boardRouter = require("./routes/boards");
// const listRouter = require("./routes/lists");
const cardRouter = require("./routes/card");
require("dotenv").config();

var salt = process.env.SALT_KEY;

app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/account", accountRouter);
// app.use("/boards", boardRouter);
// app.use("/lists", listRouter);
// app.use("/card", cardRouter);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    unset: "destroy"
  })
);

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

passport.serializeUser(function(user, done) {
  done(null, user[0].dataValues.id);
});

passport.deserializeUser(function(id, done) {
  models.user.findOne({ where: { id: id } }).then(function(user) {
    console.log(user.dataValues.id);
    done(null, user.dataValues.id);
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

var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
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
          where: { googleid: profile.id, display_name: profile.displayName }
        })
        .then(user => {
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
    var username = req.user[0].dataValues.display_name;
    console.log(username);
    res.render("./account/dashboard", { username: username });
  }
);

// Passport Github Authentication
// const GitHubStrategy = require("passport-github").Strategy;
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "https://localhost:3000/auth/github/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//       models.user.findOrCreate({ githubid: profile.id }, function(err, user) {
//         return done(err, user);
//         // User.findOrCreate(function() {
//         //   return done(null, profile);
//       });
//     }
//   )
// );

// app.get(
//   "/auth/github",
//   passport.authenticate("github", { scope: ["user:email"] }),
//   function(req, res) {
//     // console.log("You have been authorizied");
//     res.send("You have been authorizied");
//   }
// );

// app.get(
//   "/auth/github/callback",
//   passport.authenticate("github", { failureRedirect: "/login" }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("login");
//   }
// );

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/registration", (req, res) => {
  res.render("registration");
});

app.get("/logout", (req, res) => {
  if (session) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
  } else {
    console.log("Session still active");
  }
});

// Dynamic Port Setting
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("App Listening on Port " + port));
