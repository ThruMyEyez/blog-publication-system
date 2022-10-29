'use strict';
const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    publication: { type: Schema.Types.ObjectId, ref: 'Publication' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    message: {
      type: String,
      minLength: 1,
      maxLength: 1024,
      required: true
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Comment = model('Comment', commentSchema);
module.exports = Comment;
