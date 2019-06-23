const jwt = require('jsonwebtoken');

const generateToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: '1h'
  });
  return token;
};

const validateToken = token => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
  return decoded;
};

module.exports = { generateToken, validateToken };
