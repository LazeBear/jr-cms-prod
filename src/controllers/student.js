const courseService = require('../services/course');
const studentService = require('../services/student');

const {
  convertUpdateBody,
  extractS3ObjectKey,
  convertQuery,
  formatResponse
} = require('../utils/helper');
const { deleteImage } = require('../utils/upload');

async function getAllStudents(req, res) {
  const total = await studentService.countAllBySearch(req.query.q);

  const { pagination, sort, search } = convertQuery(req.query, total);

  const students = await studentService.getAll(pagination, sort, search);
  
  return formatResponse(res, { data: students, pagination });
}

async function getStudent(req, res) {
  const { id } = req.params;

  const student = await studentService.getOneWithPopulate(id, {
    courses: 'code name'
  });

  if (!student) {
    return formatResponse(res, 'Student not found', 404);
  }
  return formatResponse(res, student);
}

async function addStudent(req, res) {
  const { firstName, lastName, email } = req.body;
  const student = await studentService.createOne({
    firstName,
    lastName,
    email
  });
  return formatResponse(res, student, 201);
}

async function addCourse(req, res) {
  const { id, code } = req.params;
  const course = await courseService.getOne(code);
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }
  const student = await studentService.addCourse(id, code);
  if (!student) {
    return formatResponse(res, 'Student not found', 404);
  }
  await courseService.addSingleStudentRef(id, code);
  return formatResponse(res, student, 201);
}

async function deleteCourse(req, res) {
  const { id, code } = req.params;
  const course = await courseService.getOne(code);
  if (!course) {
    return formatResponse(res, 'Course not found', 404);
  }
  const student = await studentService.removeCourse(id, code);
  if (!student) {
    return formatResponse(res, 'Student not found', 404);
  }
  await courseService.removeSingleStudentRef(student._id, course._id);
  return formatResponse(res, student);
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const keys = ['firstName', 'lastName', 'email'];
  const student = await studentService.updateOne(
    id,
    convertUpdateBody(req.body, keys)
  );
  if (!student) {
    return formatResponse(res, 'Student not found', 404);
  }
  return formatResponse(res, student);
}

async function updateAvatar(req, res) {
  const { id } = req.params;
  if (!req.file) {
    return formatResponse(res, 'Image missing', 400);
  }
  const student = await studentService.updateOne(id, {
    avatar: req.file.location
  });
  if (!student) {
    await deleteImage(req.file.key);
    return formatResponse(res, 'Student not found', 404);
  }

  return formatResponse(res, student);
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  const student = await studentService.deleteOne(id);
  if (!student) {
    return formatResponse(res, 'Student not found', 404);
  }

  // clean the refs
  await courseService.removeStudentRefs(student._id);

  if (student.avatar) {
    await deleteImage(extractS3ObjectKey(req.baseUrl, student.avatar));
  }

  return formatResponse(res, student);
}

module.exports = {
  getAllStudents,
  addStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  addCourse,
  deleteCourse,
  updateAvatar
};
