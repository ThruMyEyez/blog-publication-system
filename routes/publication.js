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

const router = new Router();

/*
- GET -> router.get('/', (req, res, next) => {})
- GET -> router.get('/create', (req, res, next) => {})
- POST-> router.post("/create", (req, res, next) => {})
- GET -> router.get("/:id/edit", (req, res, next) => {})
- POST-> router.post('/:id/delete', routeGuard, (req, res, next) => {}); */

router.get('/', (req, res, next) => {
  res.render('');
});

router.get('/create', (req, res, next) => {});
router.post('/create', (req, res, next) => {});
router.get('/:id/edit', (req, res, next) => {});
router.post('/:id/edit', (req, res, next) => {});
router.post('/:id/delte', (req, res, next) => {});

module.exports = router;
