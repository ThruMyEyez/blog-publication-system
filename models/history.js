'use strict';

const { Schema, model } = require('mongoose');

const historySchema = new Schema(
  {
    publication: { type: Schema.Types.ObjectId, ref: 'Publication' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    isCompletelyRoad: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const History = model('History', historySchema);
module.exports = History;
