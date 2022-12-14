'use strict';

const { Router } = require('express');

const multer = require('multer');
const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2
});

const upload = multer({ storage: storage });

const User = require('./../models/user');
const Profile = require('./../models/profile');
const Follow = require('./../models/follow');
const History = require('./../models/history');
const Comment = require('./../models/comment');
const { Schema } = require('mongoose');
const routeGuard = require('../middleware/route-guard');
const { count } = require('../models/publication');

const router = new Router();

//* So far, so god ✅
router.get('/', (req, res, next) => {
  if (req.user) {
    res.redirect(`/profile/${req.user._id}`);
  } else {
    res.redirect('/authentication/sign-in');
  }
});

//* So far, so god ✅
router.get('/edit', routeGuard, (req, res, next) => {
  if (!req.user) {
    res.redirect('/authentication/sing-in');
  }
  User.findById(req.user._id)
    //.populate('profile')
    .then((user) => {
      // console.log({ ...user._doc });
      res.render('profile/edit', {
        ...user._doc,
        isOwnProfile: true,
        actEditProfileTab: 'active'
      });
    })
    .catch((error) => {
      console.log(`Error loading user profile from DB: ${error}`);
      next(error);
    });
});

//* So far, so god ☑️ | TODO: Complete req.file.path logic
router.post(
  '/edit',
  routeGuard,
  upload.single('avatarUrl'),
  (req, res, next) => {
    //If there is a new avatar set it, otherwise keep the old one.
    req.body.avatarUrl = req.file ? req.file.path : req.user.avatarUrl;
    //console.log('req.body.avatarUrl :', req.body.avatarUrl);
    User.findByIdAndUpdate(
      req.user.id,
      { ...req.body, $inc: { __v: 1 } },
      { new: true }
    )
      .then((updatedProfile) => {
        // console.log('profile updated successfully!', updatedProfile);
        res.redirect('/profile/edit');
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get('/complete', routeGuard, (req, res, next) => {
  const skills = [
    'HTML',
    'CSS',
    'Javascript',
    'Nodejs',
    'MongoDB',
    'React',
    'PHP',
    'Java',
    'Python',
    'MySQL'
  ];
  res.render('profile/completeForm', { skills });
});

//* So far, so god ✅
router.post(
  '/complete',
  routeGuard,
  upload.single('avatarFile'),
  (req, res, next) => {
    //const { fullName, age, gender, skills, experience, aboutTxt } = req.body;
    const { _id } = req.user;

    Profile.create({ user: req.user._id, ...req.body })
      .then((dbProfile) => {
        return User.findByIdAndUpdate(
          _id,
          { profile: dbProfile._id, isProfileComplete: true },
          { new: true }
        );
      })
      .then(() => {
        res.redirect('/profile');
      })
      .catch((error) => {
        console.log('A Error Occurred at creating user Profile: ', error);
        next(error);
      });
  }
);

//* So far, so god ✅ (/delete routes)
//* very basic - need improvement: ask if author want to delete all publications,
//* delete all corresponding comments if reader/author wants to
//* delete all corresponding follows from DB && History
router.get('/delete', routeGuard, (req, res, next) => {
  req.user.isOwnProfile = true;
  req.user.actEditProfileTab = 'active';
  console.log(req.user);
  res.render('profile/delete', req.user);
});

//TODO Route is okay so far - view logic needs major improvement
router.post('/delete', routeGuard, (req, res, next) => {
  const { id } = req.user;
  let profileID;
  console.log(id, req.user.profile);
  User.findByIdAndDelete(id)
    .then((result) => {
      console.log('User Deleted', result);
      return Follow.deleteMany({ follower: req.user._id });
    })
    .then((result) => {
      return result.isProfileComplete
        ? Profile.findByIdAndDelete(String(req.user.profile))
        : null;
    })
    .then((result) => {
      console.log('user + followings + profile deleted: ', result);
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

//TODO Add a view logic for this route / Pagination
//* So far, so god ✅
router.get('/follow-list', routeGuard, (req, res, next) => {
  //* control the following logic on one page reachable by this route
  //* if auth. user then get a list of authors which are followed by the user.
  //* sort this list By date.
  let follows, isAuthor;

  Follow.find({ follower: req.user._id })
    .then((followings) => {
      follows = followings;

      const { userType, isProfileComplete } = req.user;

      isAuthor = userType === 'author' && isProfileComplete;
      if (isAuthor) {
        return Follow.find({ followee: req.user._id }).populate('follower');
      }
      return;
    })
    .then((followers) => {
      const { username } = req.user;
      res.render('profile/followList', {
        follows,
        followers,
        isAuthor,
        username,
        isOwnProfile: true,
        actFollowTab: 'active'
      });
    })
    .catch((error) => {
      next(error);
    });
});

//* So far, so god ✅ TODO: Render logic
router.get('/my-history', routeGuard, (req, res, next) => {
  const { id, username } = req.user;
  let readHistory,
    perPage = 5,
    page = req.query.page ? +req.query.page : 1;

  History.find({ user: id })
    .populate({
      path: 'publication',
      select: 'title',
      populate: {
        path: 'author',
        select: 'username avatarUrl',
        populate: { path: 'profile', select: 'fullName' }
      }
    })
    .sort({ createdAt: -1 })
    .skip(perPage * (page - 1))
    .limit(perPage)
    .then((history) => {
      //* Process meta data to each read history entry
      history = history.map((entry) => {
        const lastReadDate =
          new Date().toLocaleDateString() ===
          entry.updatedAt.toLocaleDateString()
            ? 'Today'
            : entry.updatedAt.toLocaleDateString();
        return {
          ...entry._doc,
          lastReadDate: lastReadDate,
          lastReadTime: entry.updatedAt.toLocaleTimeString()
        };
      });
      readHistory = history;
      // console.log('read history of user: ', readHistory);
      return History.count({ user: id });
    })
    .then((rows) => {
      res.render('profile/history', {
        readHistory,
        pagination: {
          page: page,
          limit: perPage,
          totalRows: rows
        },
        username,
        isOwnProfile: true,
        actReadHisTab: 'active'
      });
    })
    .catch((error) => {
      console.log(`error getting read history of user from DB. ${error}`);
      next(error);
    });
});

//DONE:✅ get a list off all comments of user && sort({ createdAt: -1 }) && render it: res.render("profile/comments", {myCommentsObj})
//* So far, so god ✅ TODO: Render logic, Pagination logic
router.get('/my-comments/', routeGuard, (req, res, next) => {
  // Let variables for Pagination and UI functionality.

  const { username } = req.user;
  let perPage = 5,
    page = req.query.page ? +req.query.page : 1,
    totalNoRows,
    userComments;
  //page = req.params.page > 0 ? req.params.page : 0;
  Comment.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .skip(perPage * (page - 1))
    .limit(perPage)
    .populate({ path: 'author', select: 'username avatarUrl' })
    .exec((err, comments) => {
      userComments = comments;
      //Comment.count().exec((error, count) => {
      Comment.countDocuments({ author: req.user._id }, (error, count) => {
        totalNoRows = count;
        res.render('profile/comments', {
          userComments,
          pagination: {
            page: page,
            limit: perPage,
            totalRows: count
          },
          username,
          isOwnProfile: true,
          actCommentHisTab: 'active'
        });
      });
    });
  //.then((userComments) => {
  //  //console.log(`router.get('/my-comments', ... : ${userComments.length}`);
  //  //totalNoRows = userComments.length;
  //  res.render('profile/comments', {
  //    userComments,
  //    pagination: { page: page, limit: perPage, totalRows: totalNoRows }
  //  });
  //res.render('renderViewHTML', { pagination: { page: currentPage, limit:PageLimit,totalRows: TotalNoOfROWS }});
  //})
  //.catch((error) => {
  //  next(error);
  //});
});

router.get('/my-comments/delete', routeGuard, (req, res, next) => {
  const { id: commentId } = req.query;
  console.log('/my-comments/delete,:', commentId);
  Comment.findByIdAndUpdate(
    commentId,
    { title: 'comment removed', message: 'comment removed by user' },
    { new: true }
  )
    .then((result) => {
      console.log(result);
      res.redirect('/profile/my-comments');
    })
    .catch((error) => {
      next(error);
    });
});

//*Tasks to do =>
//??? I dont know if this route makes much sense - instead render about me Txt into profile/main
router.get('/about-me', (req, res, next) => {
  console.log("router.get('/about-me', (req, res, next) => {})");
});

//* So far, so god ✅
//DOne this should be public✅, if its users own profile => serve edit and delete functionality✅
router.get('/:id', (req, res, next) => {
  //* Main profile route for "/profile"
  const { id } = req.params;
  let userDocument;
  User.findById(id)
    .populate('profile')
    .then((user) => {
      const { createdAt } = user;
      user.createdLocalDate = createdAt.toLocaleDateString();
      user.createdLocalTime = createdAt.toLocaleTimeString();
      user.actualLocalDate = new Date().toLocaleDateString();
      user.isOwnProfile = req.user ? req.user.id === id : false;
      user.actProfileTab = 'active';
      userDocument = user;
      res.render('profile/main', userDocument);
    })
    .catch((error) => {
      console.log(`Error while getting user profile: ${error}`);
      next(error);
    });
});

//* So far, so god ✅
router.post('/:id/follow', routeGuard, (req, res, next) => {
  //Follow
  const { id } = req.params;
  Follow.create({ follower: req.user._id, followee: id })
    .then(() => {
      //      res.redirect(`/profile/${id}`);
      res.redirect('back');
    })
    .catch((error) => {
      next(error);
    });
});

//* So far, so god ✅
router.post('/:id/unfollow', routeGuard, (req, res, next) => {
  //Unfollow
  const { id } = req.params;
  Follow.findOneAndDelete({
    follower: req.user._id,
    followee: id
  })
    .then((result) => {
      console.log('success unfollowing', result);
      res.redirect('back');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
// router.post('/sign-up', (req, res, next) => {
//   const { username, email, password, user_type } = req.body;
//   bcryptjs
//     .hash(password, 10)
//     .then((hash) => {
//       return User.create({
//         username,
//         email,
//         passwordHashAndSalt: hash,
//         userType: user_type
//       });
//     })
//     .then((user) => {
//       req.session.userId = user._id;
//       res.redirect('/private');
//     })
//     .catch((error) => {
//       next(error);
//     });
// });

// router.get('/sign-in', (req, res, next) => {
//   res.render('sign-in');
// });

// router.post('/sign-in', (req, res, next) => {
//   let user;
//   const { email, password } = req.body;
//   User.findOne({ $or: [{ email: email }, { username: email }] })
//     .then((document) => {
//       if (!document) {
//         return Promise.reject(
//           new Error("There's no user with that email or username.")
//         );
//       } else {
//         user = document;
//         return bcryptjs.compare(password, user.passwordHashAndSalt);
//       }
//     })
//     .then((result) => {
//       if (result) {
//         req.session.userId = user._id;
//         if (user.userType === 'author') {
//           if (user.isProfileComplete) {
//             res.redirect('/');
//           } else {
//             res.redirect('/profile/complete');
//           }
//         } else {
//           res.redirect('/');
//         }
//       } else {
//         return Promise.reject(new Error('Wrong password.'));
//       }
//     })
//     .catch((error) => {
//       next(error);
//     });
// });
