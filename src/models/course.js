/* eslint-disable func-names */
const mongoose = require('mongoose');
const Joi = require('joi');

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      uppercase: true,
      alias: 'code'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      validate: {
        validator: url => !Joi.validate(url, Joi.string().uri()).error,
        msg: 'Invalid url format'
      }
    },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    __v: { type: Number, select: false }
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    },
    id: false
  }
);

courseSchema.statics.searchQuery = async function(pagination, sort, search) {
  const { page, pageSize } = pagination;
  return this.find({ _id: { $regex: search, $options: 'i' } })
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize);
};

module.exports = mongoose.model('Course', courseSchema);
