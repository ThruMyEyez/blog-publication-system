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
const Comment = require('../models/comment');
const Follow = require('../models/follow');

const router = new Router();

//* So far, so god ✅
router.get('/', (req, res, next) => {
  //const { id: viewerId } = req.user;
  let publications;

  Publication.find()
    .sort({ createdAt: -1 })
    .populate('author')
    .then((articles) => {
      articles.forEach((article) => {
        article.authenticatedViewer = req.user ? true : false;
        article.viewerId = req.user ? String(req.user._id) : false;
        console.log(article.author._id);
      });
      publications = articles;
      if (req.user) {
        return Follow.find({ follower: req.user._id });
      } else {
        return [];
      }
    })
    .then((follows) => {
      follows.forEach((follow) => {
        publications.forEach((article) => {
          article.isFollowed =
            String(article.author._id) === String(follow.followee)
              ? true
              : false;
        });
      });
      res.render('publications/main', { articles: publications });
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

//* 🚩✅ route is tested and works - still some functionality TODO
router.get('/:id', (req, res, next) => {
  //* Article detail page with comments
  const { id: publicationId } = req.params;
  let publication;
  // TODO: add logic => if user === road/viewed Publication don't increase numberOfViews.
  Publication.findByIdAndUpdate(
    publicationId,
    { $inc: { numberOfViews: 1 } }
    /* ,{ new: true } */
  )
    .then(() => {
      return Publication.findById(publicationId).populate({
        path: 'author',
        populate: [{ path: 'profile' }]
      });
    })
    .then((article) => {
      article.isOwn = req.user
        ? String(req.user.id) === String(article.author._id)
        : false;
      console.log(article.canModerateComments);
      publication = article;
      return Comment.find({ publication: `${publicationId}` }).populate(
        //'author'
        { path: 'author', select: 'username avatarUrl' } //[{}]
      );
    })
    .then((comments) => {
      comments = comments.map((comment) => {
        //console.log(req.user._id.toString() === comment.author._id.toString());
        return {
          ...comment._doc,
          isOwnComment: req.user
            ? String(req.user._id) === String(comment.author._id)
            : false
        };
      });

      res.render('publications/details', { article: publication, comments });
    })
    .catch((error) => {
      console.log(`Error getting publication(article) from DB: ${error}`);
      next(error);
    });
});

//* So far, so god ✅
router.post('/:id/comment', routeGuard, (req, res, next) => {
  const { id: publication } = req.params,
    { id: author } = req.user;
  //console.log('btn works!', author, '&&', publication);
  Comment.create({ publication, author, ...req.body })
    .then((comment) => {
      console.log(`successfully created new comment: ${comment}`);
      res.redirect(`/articles/${publication}`);
    })
    .catch((error) => {
      console.log(`Error at creating new comment: ${error}`);
      next(error);
    });
});

//*TODO: Make here sure that only the own author can delete | done, testing needed | W.I.P. Artur /*
//* So far, so god ✅
router.get('/:id/delete', routeGuard, (req, res, next) => {
  const { id } = req.params;
  Publication.findById(id)
    .then((publication) => {
      publication.isOwn = req.user
        ? String(req.user.id) === String(publication.author._id)
        : false;
      res.render('publications/delete', publication);
      //console.log(`is user === author for publication? => ${publication.isOwn}`);
    })
    .catch((error) => {
      console.log(`Error getting publicationDocument from DB: ${error}`);
      next(error);
    });
});
//* So far, so god ✅
router.post('/:id/delete', routeGuard, (req, res, next) => {
  console.log('POST of delete article with: ', req.params);
  const { id: publicationId } = req.params;

  Comment.deleteMany({ publication: `${publicationId}` })
    .then((result) => {
      console.log(
        `${result.deletedCount} comments deleted from publication with ID ${publicationId}.`
      );
      return Publication.findByIdAndDelete(publicationId);
    })
    .then((result) => {
      console.log(`publication with ID ${publicationId} deleted.`);
    })
    .catch((error) => {
      console.log(
        `Error during deleting of one publication and their linked comments: ${error}`
      );
      next(error);
    });
});

//*I hope you're not mad about me for doing a part of this route
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

router.post('/:id/comment/:commentId/approve', routeGuard, (req, res, next) => {
  //TODO
});

//* So far, so god ✅
router.post(
  '/:id/comment/:commentId/disapprove',
  routeGuard,
  (req, res, next) => {
    const { id, commentId } = req.params;
    console.log(id, commentId);
    Comment.findByIdAndUpdate(
      commentId,
      { isApproved: false } /*{ new: true }*/
    )
      .then(() => {
        console.log(`banned comment with ID: ${commentId}`);
        res.redirect('back');
      })
      .catch((error) => {
        next(error);
      });
  }
);
//*TODO: WORK IN PROGRESS | Artur
router.post('/:id/comment/:commentId/edit', routeGuard, (req, res, next) => {
  const { id: publicationId, commentId } = req.params;

  console.log('params for route: ', req.params);
});

module.exports = router;
