const { ObjectId } = require('mongoose').Types;
const { formatResponse } = require('../utils/helper');

module.exports = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return formatResponse(res, 'Invalid ID', 400);
  }
  return next();
};
