const Service = require('./service');

class PersonService extends Service {
  async removeCourseRefs(courseId) {
    return this.Model.updateMany(
      {
        courses: courseId
      },
      {
        $pull: {
          courses: courseId
        }
      }
    );
  }

  async addCourse(studentId, courseId) {
    return this.Model.findByIdAndUpdate(
      studentId,
      {
        $addToSet: { courses: courseId }
      },
      {
        new: true
      }
    );
  }

  async removeCourse(studentId, courseId) {
    return this.Model.findByIdAndUpdate(
      studentId,
      {
        $pull: { courses: courseId }
      },
      {
        new: true
      }
    );
  }
}

module.exports = PersonService;
