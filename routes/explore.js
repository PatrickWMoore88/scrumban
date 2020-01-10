const express = require("express");
const router = express.Router();
const models = require("../models");

function authenticate(req, res, next) {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    next();
  }
}

router.get("/", async (req, res) => {
  let data = {};
  data.legends = await models.legend.findAll();
  res.render("explore", data);
});

router.get("/:name", async (req, res) => {
  let data = {};
  data.legends = await models.legend.findOne({
    where: { name: req.params.name }
  });
  console.log(data.legends.dataValues);
  req.session.legend_id = data.legends.dataValues.id;
  res.render("legend", data);
});

module.exports = router;
