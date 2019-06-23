const userService = require('../services/user');
const { formatResponse } = require('../utils/helper');
const { generateToken } = require('../utils/jwt');

module.exports = {
  async getSelf(req, res) {
    const user = await userService.getOne(req.user.id);
    return formatResponse(res, user);
  },
  async addUser(req, res) {
    const { email, password, name } = req.body;

    const existingUser = await userService.getOneByField({ email });
    if (existingUser) {
      return formatResponse(res, 'Email already exists', 400);
    }
    const user = await userService.createOne({ name, password, email });
    const token = generateToken(user._id);
    return formatResponse(res, { email, name, token }, 201);
  }
};
