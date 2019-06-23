const router = require('express').Router();
const {
  getAllTeachers,
  addTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  addCourse,
  deleteCourse,
  updateAvatar
} = require('../controllers/teacher');
const validateId = require('../middlewares/validateId');
const { uploadImage } = require('../utils/upload');

router.get('/', getAllTeachers);
router.get('/:id', validateId, getTeacher);
router.post('/', addTeacher);
router.post('/:id/courses/:code', validateId, addCourse);
router.put('/:id', validateId, updateTeacher);
router.put(
  '/:id/avatar',
  validateId,
  uploadImage('id', 'avatar'),
  updateAvatar
);
router.delete('/:id', validateId, deleteTeacher);
router.delete('/:id/courses/:code', validateId, deleteCourse);

module.exports = router;
