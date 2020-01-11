const express = require("express");
const router = express.Router();
const models = require("../models");

function authenticate(req, res, next) {
  console.log(req.session);
  if (!req.session) {
    res.redirect("/login");
  } else {
    next();
  }
}

router.get("/", authenticate, (req, res) => {
  console.log(req.user[0].dataValues);
  res.render("account", { username: req.user[0].dataValues });
});

router.get("/dashboard", (req, res) => {
  res.render("account/dashboard");
});

router.get("/favorites", authenticate, async (req, res) => {
  try {
    // build empty object (data), inside data insert user_id from Favorites table
    let data = {};
    data.favMovies = await models.favorites
      .findAll({
        where: {
          user_id: req.session.user_id
        }
      })
      .then(results => results.map(result => result.dataValues));
    // loop for counter of index, build empty array, input all movie_ids into array, then setting movie_id to variable (idPath), pushing movie_id to
    favMovieTitlesPromises = [];
    data.favMovies.forEach(favMovie => {
      favMovieTitlesPromises.push(
        models.movies
          .findOne({ where: { id: favMovie.movie_id } })
          .then(result => result.dataValues.title)
      );
    });
    // wait for all fav movie awaits in for loop to finish
    data.favMovieTitles = await Promise.all(favMovieTitlesPromises);
    res.render("account/favorites", data);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.get("/to-watch", authenticate, async (req, res) => {
  try {
    // build empty object (data), inside data insert user_id from Favorites table
    let data = {};
    data.toWatchMovies = await models.toWatchMovies
      .findAll({
        where: {
          user_id: req.session.user_id
        }
      })
      .then(results => results.map(result => result.dataValues));
    // loop for counter of index, build empty array, input all movie_ids into array, then setting movie_id to variable (idPath), pushing movie_id to
    toWatchMovieTitlesPromises = [];
    data.toWatchMovies.forEach(toWatchMovie => {
      toWatchMovieTitlesPromises.push(
        models.movies
          .findOne({ where: { id: toWatchMovie.movie_id } })
          .then(result => result.dataValues.title)
      );
    });
    // wait for all fav movie awaits in for loop to finish
    data.toWatchMovieTitles = await Promise.all(toWatchMovieTitlesPromises);
    res.render("account/to-watch", data);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.post("/favorites/add", authenticate, async (req, res) => {
  try {
    let data = {};
    data.userFavs = await models.favorites.create({
      user_id: req.session.user_id,
      movie_id: req.session.movie_id
    });
    console.log(data.userFavs);
    res.redirect("/account/favorites");
  } catch (e) {
    res.send(e);
  }
});

router.post("/favorites/delete/:movie_id", authenticate, async (req, res) => {
  try {
    let data = {};
    data.favMoviesTitles = await models.favorites
      .findAll({
        where: {
          user_id: req.session.user_id
        }
      })
      .then(results => results.map(result => result.dataValues));
    console.log(req.params.title);
    await models.favorites.destroy({
      where: {
        movie_id: req.params.movie_id
      }
    });
    res.redirect("/account/favorites");
  } catch (e) {
    res.send(e);
  }
});

router.post("/to-watch/add", authenticate, async (req, res) => {
  try {
    await models.toWatchMovies.create({
      user_id: req.session.user_id,
      movie_id: req.session.movie_id
    });
    res.redirect("/account/to-watch");
  } catch (e) {
    res.send(e);
  }
});

router.post("/to-watch/delete", authenticate, async (req, res) => {
  try {
    await models.toWatchMovies.destroy({
      user_id: req.session.user_id,
      movie_id: req.session.movie_id
    });
    res.redirect("/account/to-watch");
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
