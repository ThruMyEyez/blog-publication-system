'use strict';
const express = require('express');
const { Router } = require('express');
const routeGuard = require('./../middleware/route-guard');
const authorGuard = require('./../middleware/author-guard');
const completedProfileGuard = require('./../middleware/completed-profile-guard');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2
});
const upload = multer({ storage: storage });

const User = require('./../models/user');
const Profile = require('./../models/profile');
const History = require('./../models/history');
const Publication = require('./../models/publication');
const Comment = require('./../models/comment');
const Follow = require('./../models/follow');
const { BOLG_CATEGORIES_TYPE } = require('./helper/helper');

const router = new Router();

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
      articles.forEach((article) => {
        article.createdLocalDate = article.createdAt.toLocaleDateString();
        article.createdLocalTime = article.createdAt.toLocaleTimeString();
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
      console.log('Created:', publications[0].createdLocalDate);
      res.render('publications/main', { articles: publications });
    })
    .catch((error) => {
      console.log(
        `Error occurred at getting publications (articles) from DB: ${error}`
      );
      next(error);
    });
});

// This route is to create a blog publication
router.get(
  '/create',
  [routeGuard, authorGuard, completedProfileGuard],
  (req, res, next) => {
    res.render('publications/create', { categories: BOLG_CATEGORIES_TYPE });
  }
);

// This route is for creating the a new publication (Article)
router.post(
  '/create',
  [
    routeGuard,
    authorGuard,
    completedProfileGuard,
    upload.single('thumbnailUrl')
  ],
  (req, res, next) => {
    // If User adds a Thumbnail set it, otherwise use default value.
    const thumbnailUrl = req.file
      ? req.file.path
      : '/images/default_thumbnail.jpg';
    const numberOfViews = 0;
    const author = req.user._id;
    const { title, categories } = req.body;

    Publication.create({
      author,
      title,
      categories,
      thumbnailUrl,
      numberOfViews
    })
      .then((result) => {
        const publicationId = result._id.toString();
        console.log('New article published / added to DB: ', result);
        res.redirect(`/articles/${publicationId}/content`);
      })
      .catch((error) => {
        console.log(`Error creating new publication(article) to DB: ${error}`);
        next(error);
      });
  }
);

router.get(
  '/my-own',
  [routeGuard, authorGuard, completedProfileGuard],
  (req, res, next) => {
    let publications,
      pagination,
      perPage = 5,
      page = req.query.page ? +req.query.page : 1;

    Publication.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .then((articles) => {
        publications = articles;
        return Publication.count({ author: req.user._id });
      })
      .then((count) => {
        pagination = {
          page: page,
          limit: perPage,
          totalRows: count
        };

        console.log(publications);
        res.render('publications/my-own', {
          articles: publications,
          pagination
        });
      })
      .catch((error) => {
        console.log(
          `Error occurred at getting publications (articles) from DB: ${error}`
        );
        next(error);
      });
  }
);
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
      article.createdLocalDate = article.createdAt.toLocaleDateString();
      article.createdLocalTime = article.createdAt.toLocaleTimeString();
      article.readerAuthenticated = !!req.user;
      article.isOwn = req.user
        ? String(req.user.id) === String(article.author._id)
        : false;
      publication = article;

      return Comment.find({ publication: `${publicationId}` }).populate({
        path: 'author',
        select: 'username avatarUrl'
      });
    })
    .then((comments) => {
      comments = comments.map((comment) => {
        return {
          ...comment._doc,
          createdLocalDate: comment.createdAt.toLocaleDateString(),
          createdLocalTime: comment.createdAt.toLocaleTimeString(),
          isOwnComment: req.user
            ? String(req.user._id) === String(comment.author._id)
            : false
        };
      });
      res.render('publications/details', { article: publication, comments });
    })
    .then(() => {
      //*✅If a user is viewing article by its ID he creates a reading history document in DB for that.
      return req.user
        ? History.findOne({ user: req.user.id, publication: publicationId })
        : null;
    })
    .then((result) => {
      //*✅create read history if there isn't one | don't create read-history if user is not authenticated.
      if (!req.user) {
        return;
      } else if (!result) {
        console.log(
          `no history for article&user! result: ${result} | Creating new history entry: `
        );
        return History.create({
          publication: publicationId,
          user: req.user.id
        });
      } else {
        //*✅This increments __v & updates the time - for a how often and when the article was read by the User an when.
        return History.findOneAndUpdate(
          { user: req.user.id, publication: publicationId },
          { $inc: { __v: 1 } }
        );
      }
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
//*ROUTES TO DO
router.post('/:id/content', (req, res, next) => {
  const { id } = req.params;
  console.log('Hi, I am called');
  console.log(req.body);
  Publication.findByIdAndUpdate(
    id,
    { content: req.body.body, publication: id },
    { $inc: { __v: 1 } }
  )
    .then((data) => {
      res.redirect('/articles/' + id);
    })
    .catch((error) => {
      next(error);
    });
});
router.get('/:id/content/edit', (req, res, next) => {});
router.post('/:id/content/edit', (req, res, next) => {});
router.get('/:id/edit', (req, res, next) => {});
router.post('/:id/edit', (req, res, next) => {});

//* So far, so god ✅
router.post('/:id/comment/:commentId/approve', routeGuard, (req, res, next) => {
  const { id, commentId } = req.params;
  Comment.findByIdAndUpdate(commentId, { isApproved: true } /*{ new: true }*/)
    .then(() => {
      console.log(`unbanned comment with ID: ${commentId}`);
      res.redirect('back');
    })
    .catch((error) => {
      console.log(`Error at unbanning/ allowing a comment by author: ${error}`);
      next(error);
    });
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
        console.log(`Error at disapproving a comment by an author: ${error}`);
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
