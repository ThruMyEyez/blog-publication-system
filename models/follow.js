'use strict';

const { Schema, model } = require('mongoose');

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    followee: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
  },
  { timestamps: true }
);

const Follow = model('Follow', followSchema);

module.exports = Follow;
