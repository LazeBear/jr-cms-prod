const express = require('express');
const { login } = require('../controllers/auth');
const validateAuth = require('../middlewares/validateAuth');

const router = express.Router();

router.post('/', validateAuth, login);

module.exports = router;
