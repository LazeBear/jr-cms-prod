const router = require('express').Router();
const {
  getAllCourses,
  addCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  updateImage
} = require('../controllers/course');
const { uploadImage } = require('../utils/upload');

router.get('/', getAllCourses);
router.get('/:code', getCourse);
router.put('/:code', updateCourse);
router.put('/:code/image', uploadImage('code', 'image'), updateImage);
router.post('/', addCourse);
router.delete('/:code', deleteCourse);

module.exports = router;
