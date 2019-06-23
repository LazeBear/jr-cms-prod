const mongoose = require('mongoose');
const { generateToken } = require('../src/utils/jwt');

const TEST_USER = {
  _id: mongoose.Types.ObjectId('5c793331bc99fc1510b846b7').toHexString(),
  name: 'test',
  email: 'test@test.com',
  password: 'test123'
};
const TOKEN = generateToken(TEST_USER._id);

module.exports = {
  TEST_USER,
  TOKEN
};
