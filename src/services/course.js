const Course = require('../models/course');
const Service = require('./service');

class CourseService extends Service {
  async countAllWithSearch(search) {
    const count = await this.Model.searchQueryCount(search);
    return count;
  }

  async removeTeacherRefs(teacherId) {
    return this.Model.updateMany(
      {
        teachers: teacherId
      },
      {
        $pull: {
          teachers: teacherId
        }
      }
    );
  }

  async removeStudentRefs(studentId) {
    return this.Model.updateMany(
      {
        students: studentId
      },
      {
        $pull: {
          students: studentId
        }
      }
    );
  }

  async addSingleStudentRef(studentId, courseId) {
    return this.Model.findByIdAndUpdate(
      courseId,
      {
        $addToSet: {
          students: studentId
        }
      },
      {
        new: true
      }
    );
  }

  // this is for students/:id/courses/:code
  async removeSingleStudentRef(studentId, courseId) {
    return this.Model.findByIdAndUpdate(courseId, {
      $pull: {
        students: studentId
      }
    });
  }

  async addSingleTeacherRef(teacherId, courseId) {
    return this.Model.findByIdAndUpdate(
      courseId,
      {
        $addToSet: {
          teachers: teacherId
        }
      },
      {
        new: true
      }
    );
  }

  // this is for teachers/:id/courses/:code
  async removeSingleTeacherRef(teacherId, courseId) {
    return this.Model.findByIdAndUpdate(courseId, {
      $pull: {
        teachers: teacherId
      }
    });
  }
}

module.exports = new CourseService(Course);
