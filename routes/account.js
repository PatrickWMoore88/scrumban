const express = require("express");
const router = express.Router();
const models = require("../models");

router.get("/", (req, res) => {
  console.log(req.user[0].dataValues);
  res.render("account", { username: req.user[0].dataValues });
});

router.get("/dashboard", (req, res) => {
  res.render("account/dashboard");
});

router.get("/boards", (req, res) => {
  res.render("account/boards");
});

router.post("/boards/add", (req, res) => {
  console.log(req.session);
  models.board
    .create({
      name: req.body.board_name,
      owner_id: req.session.passport.user
    })
    .then(function(board) {
      console.log(board);
      res.redirect("/account/boards");
    });
});

module.exports = router;
