'use strict';

const { Router } = require('express');
const routeGuard = require('./../middleware/route-guard');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2
});

const upload = multer({ storage: storage });

const User = require('../models/user');
const Profile = require('../models/profile');
const Publication = require('../models/publication');

const router = new Router();

//* So far, so god ✅
router.get('/', (req, res, next) => {
  Publication.find()
    .populate('author')
    .then((articles) => {
      console.log(articles);
      res.render('publications/main', { articles });
    })
    .catch((error) => {
      console.log(
        `Error occurred at getting publications (articles) from DB: ${error}`
      );
      next(error);
    });
});

//* So far, so god ✅
router.get('/create', (req, res, next) => {
  //* Author create new Article
  //* Helper Array variable with predefined categories.
  const categories = [
    'Web development',
    'E-Commerce',
    'CSS',
    'UX Design',
    'Fronted frameworks',
    'Databases',
    'Cybersecurity'
  ];
  res.render('publications/create', { categories });
});

//* So far, so god ✅
router.post('/create', (req, res, next) => {
  //* Author create new Article
  req.body.numberOfViews = 0;
  Publication.create({ author: req.user._id, ...req.body })
    .then((result) => {
      const publicationId = result._id.toString();
      console.log('article published / added to DB: ', result);
      res.redirect(`/articles/${publicationId}/content`);
    })
    .catch((error) => {
      console.log(`Error creating new publication(article) to DB: ${error}`);
      next(error);
    });
});

router.get('/:id', (req, res, next) => {
  //* Article detail page with comments
});

//*I hope you're not mad about me for doing part of this route
//*It was necessary for my routes.
router.get('/:id/content', (req, res, next) => {
  const { id } = req.params;

  Publication.findById(id)
    .populate('author')
    .then((dbArticle) => {
      res.render('publications/content', dbArticle);
    })
    .catch((error) => {
      next(error);
    });
});
router.post('/:id/content', (req, res, next) => {});
router.get('/:id/content/edit', (req, res, next) => {});
router.post('/:id/content/edit', (req, res, next) => {});
router.get('/:id/edit', (req, res, next) => {});
router.post('/:id/edit', (req, res, next) => {});
//
router.get('/:id/delete', (req, res, next) => {});
router.post('/:id/delete', (req, res, next) => {});
router.post('/:id/comment', routeGuard, (req, res, next) => {});
router.post('/:id/comment/:commentId/edit', routeGuard, (req, res, next) => {});
router.post(
  '/:id/comment/:commentId/approve',
  routeGuard,
  (req, res, next) => {}
);
router.post(
  '/:id/comment/:commentId/disapprove',
  routeGuard,
  (req, res, next) => {}
);
//

module.exports = router;
