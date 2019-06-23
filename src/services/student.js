const Student = require('../models/student');
const PersonService = require('./person');

class StudentService extends PersonService {}

module.exports = new StudentService(Student);
