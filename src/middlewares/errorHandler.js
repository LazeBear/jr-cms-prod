const logger = require('../utils/logger');
const { formatResponse } = require('../utils/helper');

function parseValidationError(error) {
  let msg = error.message;
  // eslint-disable-next-line prefer-destructuring
  msg = msg.split('alidation failed: ')[1];
  msg = msg.split(', ');
  return msg;
}

module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return formatResponse(res, parseValidationError(err), 400);
  }
  // this cannot be reproduced, waiting for more feedback
  if (err.type === 'entity.parse.failed') {
    return formatResponse(res, `${err.body}\nparse failed`, 400);
  }
  if (err.name === 'MulterError') {
    return formatResponse(res, err.message, 400);
  }
  logger.error('---Unexpected exception start---');
  logger.error(`req header: ${JSON.stringify(req.headers)}`);
  logger.error(err);
  logger.error('---Unexpected exception end---');
  return formatResponse(res, err, 500);
};
