'use strict';

const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const express = require('express');
const createError = require('http-errors');
const connectMongo = require('connect-mongo');
const expressSession = require('express-session');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const mongoose = require('mongoose');
const authenticationDeserializer = require('./middleware/authentication-deserializer.js');
const baseRouter = require('./routes/base');
const authenticationRouter = require('./routes/authentication');
const profileRouter = require('./routes/profile');
const publicationRouter = require('./routes/publication');
const hbs = require('hbs');
const paginator = require('./views/helpers/hbsPaginate');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));
//* Handlebars custom helper goes here:
hbs.registerHelper('ifEqual', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('currentIndex', function (value) {
  return parseInt(value) + 1;
});
hbs.registerHelper('dateFormat', function (value) {
  return value.toLocaleDateString();
});

hbs.registerHelper('trimString', function (passedString) {
  if (passedString) {
    var theString = passedString.substring(0, 20);

    return passedString.length > 20
      ? new hbs.SafeString(theString + '...')
      : new hbs.SafeString(theString);
  } else {
    return ' ';
  }
});

hbs.registerHelper('isSet', function (value) {
  return value ? true : false;
});

hbs.registerHelper('paginator', paginator);

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: path.join('styles'),
    dest: path.join(__dirname, 'public/styles'),
    prefix: '/styles',
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: process.env.NODE_ENV === 'development'
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    store: connectMongo.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60
    })
  })
);
app.use(authenticationDeserializer);

app.use('/', baseRouter);
app.use('/authentication', authenticationRouter);
app.use('/profile', profileRouter);
app.use('/articles', publicationRouter);
// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});

const { NODE_ENV, PORT, MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Database connected to URI "${MONGODB_URI}"`);
    app
      .listen(Number(PORT), () => {
        console.log(`Server listening to requests on port ${PORT}`);
        if (NODE_ENV === 'development') {
          console.log(`Visit http://localhost:${PORT} to develop your app`);
        }
      })
      .on('error', (error) => {
        console.log('There was a server error.', error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log(
      `There was an error connecting to the database "${MONGODB_URI}"`,
      error
    );
  });
