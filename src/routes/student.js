const router = require('express').Router();
const {
  getAllStudents,
  addStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  addCourse,
  deleteCourse,
  updateAvatar
} = require('../controllers/student');
const validateId = require('../middlewares/validateId');
const { uploadImage } = require('../utils/upload');

router.get('/', getAllStudents);
router.get('/:id', validateId, getStudent);
router.post('/', addStudent);
router.post('/:id/courses/:code', validateId, addCourse);
router.put('/:id', validateId, updateStudent);
router.put(
  '/:id/avatar',
  validateId,
  uploadImage('id', 'avatar'),
  updateAvatar
);
router.delete('/:id', validateId, deleteStudent);
router.delete('/:id/courses/:code', validateId, deleteCourse);

module.exports = router;
