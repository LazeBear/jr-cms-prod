const Joi = require('joi');
const { formatResponse } = require('../utils/helper');

function validate(req) {
  const schema = {
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .required(),
    name: Joi.string().optional()
  };

  return Joi.validate(req, schema);
}
module.exports = (req, res, next) => {
  const { error } = validate(req.body);
  if (error) {
    return formatResponse(res, error.details[0].message, 400);
  }
  return next();
};
