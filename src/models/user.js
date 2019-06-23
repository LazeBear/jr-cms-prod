/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      // cannot validate the uniqueness here, it will break the update function
      validate: {
        validator: email => !Joi.validate(email, Joi.string().email()).error,
        msg: 'Invalid email format'
      }
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    __v: { type: Number, select: false }
  },
  {
    timestamps: true
  }
);

userSchema.methods.hashPassword = async function() {
  this.password = await bcrypt.hash(this.password, 10);
};

userSchema.methods.validatePassword = async function(password) {
  const validPassword = await bcrypt.compare(password, this.password);
  return validPassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
