/* eslint-disable func-names */
const mongoose = require('mongoose');
const Joi = require('joi');

const personSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: email => !Joi.validate(email, Joi.string().email()).error,
        msg: 'Invalid email format'
      }
    },
    avatar: {
      type: String,
      validate: {
        validator: url => !Joi.validate(url, Joi.string().uri()).error,
        msg: 'Invalid url format'
      }
    },
    courses: [{ type: String, ref: 'Course' }],
    __v: { type: Number, select: false },
    createdAt: { type: Date, select: false },
    updatedAt: { type: Date, select: false }
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

personSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

personSchema.statics.searchQuery = async function(pagination, sort, key) {
  const { page, pageSize } = pagination;
  const aggregate = [
    {
      $addFields: {
        fullName: {
          $concat: ['$firstName', ' ', '$lastName']
        }
      }
    },
    {
      $match: { fullName: new RegExp(key, 'i') }
    },
    {
      $project: {
        __v: 0,
        createdAt: 0,
        updatedAt: 0
      }
    },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize }
  ];
  if (Object.keys(sort).length) {
    aggregate.splice(2, 0, { $sort: sort });
  }
  return this.aggregate(aggregate);
};

personSchema.statics.searchByKeyword = async function(key) {
  const aggregate = [
    {
      $addFields: {
        fullName: {
          $concat: ['$firstName', ' ', '$lastName']
        }
      }
    },
    {
      $match: { fullName: new RegExp(key, 'i') }
    },
    {
      $project: {
        __v: 0,
        createdAt: 0,
        updatedAt: 0
      }
    },
  ];
  return this.aggregate(aggregate);
};
// return a copy
module.exports = (() => personSchema.clone())();
