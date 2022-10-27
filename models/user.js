'use strict';

//const mongoose = require('mongoose'); can be deleted.
const { Schema, model } = require('mongoose');
// TODO: later add err messages like => required: [true, "Email is required."]
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
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
    isEmailConfirmed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const User = model('User', userSchema);

module.exports = User;
