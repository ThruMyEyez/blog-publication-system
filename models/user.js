'use strict';

//const mongoose = require('mongoose'); can be deleted.
const { Schema, model } = require('mongoose');
// TODO: later add err messages like => required: [true, "Email is required."]
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHashAndSalt: {
      type: String,
      required: true
    },
    emailConfirmed: { type: Boolean, default: false },
    avatarUrl: { type: String, default: 'images/default_avatar.jpg' },
    isProfileComplete: { type: Boolean, default: false },
    userType: { type: String, enum: ['reader', 'author'], default: 'reader' }
  },
  { timestamps: true }
);

const User = model('User', userSchema);

module.exports = User;
