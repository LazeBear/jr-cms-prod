const courseService = require('../services/course');
const studentService = require('../services/student');
const teacherService = require('../services/teacher');

const {
  convertUpdateBody,
  extractS3ObjectKey,
  convertQuery,
  formatResponse
} = require('../utils/helper');
const { deleteImage } = require('../utils/upload');

async function getAllCourses(req, res) {
  const { q } = req.query;
  let total;
  if (q) {
    total = await courseService.countAllWithSearch(q);
  } else {
    total = await courseService.countAll();
  }

  const { pagination, sort, search } = convertQuery(req.query, total);

  const courses = await courseService.getAll(pagination, sort, search);

  return formatResponse(res, { data: courses, pagination });
}

async function getCourse(req, res) {
  const { code } = req.params;
  const course = await courseService.getOneWithPopulate(code, {
    teachers: 'firstName lastName',
    students: 'firstName lastName'
  });
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }

  return formatResponse(res, course);
}

async function addCourse(req, res) {
  const { name, code, description } = req.body;
  // const existingCourse = await courseService.getOne(code);
  // if (existingCourse) {
  //   return formatResponse(res, 'Duplicate course code', 400);
  // }
  const course = await courseService.createOne({
    name,
    description,
    _id: code
  });
  return formatResponse(res, course, 201);
}

async function updateCourse(req, res) {
  const { code } = req.params;
  const keys = ['name', 'description'];
  const course = await courseService.updateOne(
    code,
    convertUpdateBody(req.body, keys)
  );
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }

  return formatResponse(res, course);
}

async function updateImage(req, res) {
  const { code } = req.params;
  if (!req.file) {
    return formatResponse(res, 'Image missing', 400);
  }
  const course = await courseService.updateOne(code, {
    image: req.file.location
  });
  if (!course) {
    await deleteImage(req.file.key);
    return formatResponse(res, 'Course not found', 404);
  }

  return formatResponse(res, course);
}

async function deleteCourse(req, res) {
  const { code } = req.params;
  const course = await courseService.deleteOne(code);
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }

  // clean the refs
  await studentService.removeCourseRefs(course._id);
  await teacherService.removeCourseRefs(course._id);

  if (course.image) {
    await deleteImage(extractS3ObjectKey(req.baseUrl, course.image));
  }

  return formatResponse(res, course);
}

module.exports = {
  getAllCourses,
  addCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  updateImage
};
