'use strict';

const { Schema, model } = require('mongoose');

const publicationSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 160
    },
    thumbnailUrl: { type: String, default: '/images/default_thumbnail.jpg' },
    categories: {
      type: [String]
    },
    content: {
      type: Object
    },
    numberOfViews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Publication = model('Publication', publicationSchema);

module.exports = Publication;
