const { formatResponse } = require('../utils/helper');
const { validateToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader)
    return formatResponse(
      res,
      'Access denied. No Authorization Header provided.',
      401
    );
  const contentArr = authHeader.split(' ');
  if (contentArr.length !== 2 || contentArr[0] !== 'Bearer')
    return formatResponse(
      res,
      'Access denied. Invalid token format, should be "Bearer {TOKEN}".',
      401
    );
  const decoded = validateToken(contentArr[1]);
  if (decoded) {
    req.user = decoded;
    return next();
  }
  return formatResponse(res, 'Access denied. Invalid token.', 401);
};
