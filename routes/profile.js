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
const { Schema } = require('mongoose');
const routeGuard = require('../middleware/route-guard');

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
    .populate('profile')
    .then((user) => {
      console.log(user);
      res.render('profile/edit', user);
    })
    .catch((error) => {
      console.log(`Error loading user profile from DB: ${error}`);
      next(error);
    });
});

//* So far, so god ✅ (base version => will be extended)
router.post(
  '/edit',
  routeGuard,
  upload.single('avatarUrl'),
  (req, res, next) => {
    req.body.avatarUrl = req.file.path;
    console.log('POST OF /profile/edit', req.body);
    //console.log(req.file.path);
    User.findByIdAndUpdate(
      req.user.id,
      { ...req.body, $inc: { __v: 1 } },
      { new: true }
    )
      .then((updatedProfile) => {
        console.log('profile updated successfully!');
        res.redirect('/profile/edit');
      })
      .catch((error) => {
        next(error);
      });
  }
);

//* So far, so god ✅
//TODO Add "edit" button / anchor and route..
//TODO this should be public, if its users own profile => serve edit and delete functionality
router.get('/:id', routeGuard, (req, res, next) => {
  //* Main profile route for "/profile"
  const { id } = req.params;
  User.findById(id)
    .populate('profile')
    .then((user) => {
      const { createdAt } = user;
      user.createdLocalDate = createdAt.toLocaleDateString();
      user.createdLocalTime = createdAt.toLocaleTimeString();
      user.actualLocalDate = new Date().toLocaleDateString();
      user.isOwnProfile = req.user.id === id;
      res.render('profile/main', user);
    })
    .catch((error) => {
      console.log(`Error while getting user profile: ${error}`);
      next(error);
    });
});

//TODO Fix bug Cast to ObjectId failed for value "complete" (type string) at path "_id" for model "User"
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

//* So far, so god ✅
router.post('/:id/follow', routeGuard, (req, res, next) => {
  //Follow
  const { id } = req.params;
  Follow.create({ follower: req.user._id, followee: id })
    .then(() => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

//TODO W.I.P.
router.post('/:id/unfollow', routeGuard, (req, res, next) => {
  //Unfollow
  const { id } = req.params;
  Follow.findOneAndDelete({
    follower: req.user._id,
    followee: id
  });
});

router.get('/delete', routeGuard, (req, res, next) => {
  console.log('DELETE PROFILE PAGE');
  res.render('profile/delete');
});

//*Tasks to do =>
router.post('/delete', routeGuard, (req, res, next) => {});
router.get('/about-me', (req, res, next) => {});
router.get('/follow-list', routeGuard, (req, res, next) => {});

router.get('/my-history', (req, res, next) => {});
router.get('/my-comments', (req, res, next) => {});

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
