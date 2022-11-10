'use strict';

// Route Guard Middleware
// This piece of middleware is going to check if a user is an author
// If not, it sends the request to the app error handler with a message
module.exports = (req, res, next) => {
  if (req.user && req.user.isProfileComplete === true) {
    next();
  } else {
    const error = new Error('AUTHORIZATION REQUIRED: You should complete your profile to access this page!');
    error.status = 401;
    next(error);
  }
};
