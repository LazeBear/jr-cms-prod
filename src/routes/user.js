const express = require('express');
const { getSelf, addUser } = require('../controllers/user');
const authGuard = require('../middlewares/authGuard');
const validateAuth = require('../middlewares/validateAuth');

const router = express.Router();

router.get('/me', authGuard, getSelf);

router.post('/', validateAuth, addUser);

module.exports = router;
