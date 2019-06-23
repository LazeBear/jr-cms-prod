require('envdotjson').load();
const mongoose = require('mongoose');
const { connectToDB } = require('../src/utils/db');
const User = require('../src/models/user');

const { TEST_USER } = require('./data');

module.exports = async () => {
  await connectToDB();
  await mongoose.connection.db.dropDatabase();
  const user = new User(TEST_USER);
  await user.hashPassword();
  await user.save();
};
