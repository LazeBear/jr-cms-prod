const courseService = require('../services/course');
const teacherService = require('../services/teacher');
const {
  convertUpdateBody,
  extractS3ObjectKey,
  convertQuery,
  formatResponse
} = require('../utils/helper');
const { deleteImage } = require('../utils/upload');

async function getAllTeachers(req, res) {
  const total = await teacherService.countAll();
  const { pagination, sort, search } = convertQuery(req.query, total);

  const teachers = await teacherService.getAll(pagination, sort, search);

  return formatResponse(res, { data: teachers, pagination });
}

async function getTeacher(req, res) {
  const { id } = req.params;

  const teacher = await teacherService.getOneWithPopulate(id, {
    courses: 'code name'
  });

  if (!teacher) {
    return formatResponse(res, 'Teacher not found', 404);
  }
  return formatResponse(res, teacher);
}

async function addTeacher(req, res) {
  const { firstName, lastName, email } = req.body;
  const teacher = await teacherService.createOne({
    firstName,
    lastName,
    email
  });
  return formatResponse(res, teacher, 201);
}

async function addCourse(req, res) {
  const { id, code } = req.params;
  const course = await courseService.getOne(code);
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }
  const teacher = await teacherService.addCourse(id, code);
  if (!teacher) {
    return formatResponse(res, 'Teacher not found', 404);
  }
  await courseService.addSingleTeacherRef(id, code);
  return formatResponse(res, teacher, 201);
}

async function deleteCourse(req, res) {
  const { id, code } = req.params;
  const course = await courseService.getOne(code);
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }
  const teacher = await teacherService.removeCourse(id, code);
  if (!teacher) {
    return formatResponse(res, 'Teacher not found', 404);
  }
  await courseService.removeSingleTeacherRef(teacher._id, course._id);
  return formatResponse(res, teacher);
}

async function updateTeacher(req, res) {
  const { id } = req.params;
  const keys = ['firstName', 'lastName', 'email'];
  const teacher = await teacherService.updateOne(
    id,
    convertUpdateBody(req.body, keys)
  );
  if (!teacher) {
    return formatResponse(res, 'Teacher not found', 404);
  }
  return formatResponse(res, teacher);
}

async function updateAvatar(req, res) {
  const { id } = req.params;
  if (!req.file) {
    return formatResponse(res, 'Image missing', 400);
  }
  const teacher = await teacherService.updateOne(id, {
    avatar: req.file.location
  });
  if (!teacher) {
    await deleteImage(req.file.key);
    return formatResponse(res, 'Teacher not found', 404);
  }

  return formatResponse(res, teacher);
}

async function deleteTeacher(req, res) {
  const { id } = req.params;
  const teacher = await teacherService.deleteOne(id);
  if (!teacher) {
    return formatResponse(res, 'Teacher not found', 404);
  }

  // clean the refs
  await courseService.removeTeacherRefs(teacher._id);

  if (teacher.avatar) {
    await deleteImage(extractS3ObjectKey(req.baseUrl, teacher.avatar));
  }

  return formatResponse(res, teacher);
}

module.exports = {
  getAllTeachers,
  addTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  addCourse,
  deleteCourse,
  updateAvatar
};
