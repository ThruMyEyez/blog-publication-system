'use strict';

const { Schema, model } = require('mongoose');

const profileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, trim: true },
    // gender: { type: String, enum: ['Male', 'Female'], required: true },
    skills: [String],
    experience: [String],
    aboutTxt: { type: String, minLength: 10, maxLength: 1024, trim: true }
  },
  { timestamps: true }
);

const Profile = model('Profile', profileSchema);

module.exports = Profile;
