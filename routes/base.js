'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

//* can be removed later, it was meant for learning/practice
router.post('/', express.json(), (req, res, next) => {
  const { title } = req.body;
  console.log(req.body);

  //Publication.create({
  //  author: req.user._id,
  //  title: req.body.title,
  //  content: req.body
  //});
});

//* redundant route
router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
