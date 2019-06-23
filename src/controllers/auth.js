const userService = require('../services/user');
const { formatResponse } = require('../utils/helper');
const { generateToken } = require('../utils/jwt');

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.validateUser(email, password);
    if (!user) return formatResponse(res, 'Invalid email or password.', 401);

    const token = generateToken(user._id);
    return formatResponse(res, { name: user.name, token });
  }
};
