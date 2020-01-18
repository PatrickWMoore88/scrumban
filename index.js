// Express, Body-Parser, and Encrytion Setup
const express = require("express");
const app = express();
// const session = require("express-session");
const models = require("./models");
const bodyParser = require("body-parser");
const pbkdf2 = require("pbkdf2");
// const passport = require("passport");
const accountRouter = require("./routes/account");
const localstrat = require("./routes/localstrat");
const googlestrat = require("./routes/googlestrat");
require("dotenv").config();

var salt = process.env.SALT_KEY;

app.set("view engine", "pug");

// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true
//     // unset: "destroy"
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
// Passport Setup
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/account", accountRouter);

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

// passport.serializeUser(function(user, done) {
//   done(null, user.dataValues.id);
// });

// passport.deserializeUser(function(id, done) {
//   models.user.findOne({ where: { id: id } }).then(function(user) {
//     done(null, user.dataValues.id);
//   });
// });

// Passport Local Authentication
// const localStrategy = require("passport-local").Strategy;
// passport.use(
//   new localStrategy(function(name, password, done) {
//     console.log("local strat");
//     models.user
//       .findOne({
//         where: {
//           name: name
//         }
//       })
//       .then(function(user) {
//         console.log(user);
//         if (!user) {
//           return done(null, false);
//         }
//         if (user.password != encryptionPassword(password)) {
//           return done(null, false);
//         }
//         return done(null, user);
//       })
//       .catch(function(err) {
//         return done(err);
//       });
//   })
// );

// var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// // Passport GoogleStrategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback"
//     },
//     (accesstoken, tokenSecret, profile, done) => {
//       models.user
//         .findOrCreate({
//           where: {
//             googleid: profile.id,
//             display_name: profile.displayName,
//             name: profile.displayName
//           }
//         })
//         .then(user => {
//           console.log(user[0].dataValues);
//           console.log(
//             "User Has Been Found/Created: " + user[0].dataValues.display_name
//           );
//           done(null, user);
//         });
//     }
//   )
// );

// app.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile"]
//   }),
//   (res, req) => {}
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     var display_name = req.user[0].dataValues.display_name;
//     res.render("./account/dashboard", { display_name: display_name });
//   }
// );

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

app.post("/register", async (req, res) => {
  await models.user
    .findOne({
      where: { name: req.body.user_name }
    })
    .then(function(registeredUser) {
      if (registeredUser) {
        console.log(new Error("Sorry, please try a different User Name"));
        res.redirect("/registration");
      } else {
        models.user
          .create({
            name: req.body.username,
            display_name: req.body.display_name,
            password: encryptionPassword(req.body.password),
            confirm_password: encryptionPassword(req.body.confirm_password)
          })
          .then(function(user) {
            res.redirect("/login");
          });
      }
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/error" }),
  (req, res) => {
    res.redirect("/signed_in");
  }
);

app.get("/signed_in", (req, res) => {
  res.render("./account/dashboard");
});

app.get("/logout", (req, res) => {
  if (session) {
    req.session.destroy();
    req.logout();
    res.redirect("/login");
  } else {
    console.log("Session still active");
  }
});

// Dynamic Port Setting
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("App Listening on Port " + port));
