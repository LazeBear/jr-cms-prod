const express = require('express');
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const courseRoute = require('./routes/course');
const teacherRoute = require('./routes/teacher');
const studentRoute = require('./routes/student');
const authGuard = require('./middlewares/authGuard');

const router = express.Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/courses', authGuard, courseRoute);
router.use('/teachers', authGuard, teacherRoute);
router.use('/students', authGuard, studentRoute);

module.exports = router;
