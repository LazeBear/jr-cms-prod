const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
