const User = require('../models/user');
const Service = require('./service');

class UserService extends Service {
  async createOne(fields) {
    const document = new this.Model(fields);
    await document.hashPassword();
    await document.save();
    return document;
  }

  async getOneByField(field) {
    return this.Model.findOne(field);
  }

  async validateUser(email, password) {
    const user = await this.Model.findOne({ email }).select('password name');
    const validPassword = await user.validatePassword(password);
    return validPassword ? user : null;
  }
}

module.exports = new UserService(User);
