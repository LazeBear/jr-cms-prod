const Teacher = require('../models/teacher');
const PersonService = require('./person');

class TeacherService extends PersonService {}

module.exports = new TeacherService(Teacher);
