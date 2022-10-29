'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { username, email, password, user_type } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        username,
        email,
        passwordHashAndSalt: hash,
        userType: user_type
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ $or: [{ email: email }, { username: email }] })
    .then((document) => {
      if (!document) {
        return Promise.reject(
          new Error("There's no user with that email or username.")
        );
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        if (user.userType === 'author') {
          if (user.isProfileComplete) {
            res.redirect('/');
          } else {
            res.redirect('/profile/complete');
          }
        } else {
          res.redirect('/');
        }
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
