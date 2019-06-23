const request = require('supertest');
const mongoose = require('mongoose');
const Student = require('../../../src/models/student');
const Course = require('../../../src/models/course');
const server = require('../../../src/server');
const { TOKEN } = require('../../data');
const {
  deleteImage,
  checkResourceExist
} = require('../../../src/utils/upload');

beforeAll(async () => {
  await Student.deleteMany({});
});

describe('/v1/students', () => {
  describe('GET /', () => {
    const students = [
      {
        firstName: 'Ab',
        lastName: 'Bb',
        email: 'test@test.com'
      },
      {
        firstName: 'Ab',
        lastName: 'Ab',
        email: 'test@test.com'
      },
      {
        firstName: 'Ca',
        lastName: 'Bb',
        email: 'test@test.com'
      }
    ];
    const exec = query =>
      request(server)
        .get(`/v1/students${query ? `?${query}` : ''}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await Student.insertMany(students);
    });

    afterAll(async () => {
      await Student.deleteMany({});
    });

    it('should return all students', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should return 2 students with pageSize=1', async () => {
      const res = await exec('pageSize=1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(1);
    });

    it('should return 2 students with pagination', async () => {
      const res = await exec('page=1&pageSize=2');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
    });

    it('should return 1 student with search key', async () => {
      const res = await exec('q=b a');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]).toMatchObject(students[1]);
    });

    it('should return 2 student with search and sort', async () => {
      const res = await exec('q=ab&sort=lastName');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toMatchObject(students[1]);
    });

    it('should return correct order with single key sort', async () => {
      const res = await exec('sort=-firstName');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0]).toMatchObject(students[2]);
      expect(res.body.data[1]).toMatchObject(students[0]);
      expect(res.body.data[2]).toMatchObject(students[1]);
    });

    it('should return correct order with multi-key sort', async () => {
      const res = await exec('sort=-firstName,lastName');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0]).toMatchObject(students[2]);
      expect(res.body.data[1]).toMatchObject(students[1]);
      expect(res.body.data[2]).toMatchObject(students[0]);
    });
  });

  describe('POST /', () => {
    const exec = body =>
      request(server)
        .post(`/v1/students`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(body);

    it('should return 400 if email is missing', async () => {
      const student = {
        firstName: 'mason',
        lastName: 'test'
      };
      const res = await exec(student);
      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid email', async () => {
      const student = {
        firstName: 'mason',
        lastName: 'test',
        email: 'test@'
      };
      const res = await exec(student);
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 2 chars', async () => {
      const student = {
        firstName: 'm',
        lastName: 'test',
        email: 'test@test.com'
      };
      const res = await exec(student);
      expect(res.status).toBe(400);
    });

    it('should return 201 if all fields are valid', async () => {
      const student = {
        firstName: 'mason',
        lastName: 'test',
        email: 'test@test.com'
      };
      const res = await exec(student);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /:id', () => {
    const fields = {
      email: 'test@test.com',
      firstName: 'name',
      lastName: 'name'
    };
    const student = new Student(fields);

    const exec = id =>
      request(server)
        .get(`/v1/students/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await student.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Student()._id;
      const res = await exec(id);
      expect(res.status).toBe(404);
    });

    it('should return 200 if object id exist', async () => {
      const res = await exec(student._id);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(fields);
    });
  });

  describe('PUT /:id', () => {
    const fields = {
      email: 'test@test.com',
      firstName: 'name',
      lastName: 'name'
    };
    const student = new Student(fields);

    const exec = (id, body) =>
      request(server)
        .put(`/v1/students/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(body);

    beforeAll(async () => {
      await student.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Student()._id;
      const res = await exec(id, {});
      expect(res.status).toBe(404);
    });

    it('should update the document if object id exist', async () => {
      const newDoc = {
        firstName: 'newName',
        lastName: 'newName',
        email: 'new@test.com'
      };
      const res = await exec(student._id, newDoc);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(newDoc);
    });

    it('should return 400 if the update object is invalid', async () => {
      const newDoc = {
        email: 'new'
      };
      const res = await exec(student._id, newDoc);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id/avatar', () => {
    const studentId = '5c7c7433e7e50f67901c13d0';
    const key = `students/${studentId}.jpeg`;
    const student = new Student({
      _id: mongoose.Types.ObjectId(studentId).toHexString(),
      email: 'test@test.com',
      firstName: 'name',
      lastName: 'name'
    });

    const exec = (id, file) =>
      request(server)
        .put(`/v1/students/${id}/avatar`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .attach('avatar', file);

    beforeAll(async () => {
      await student.save();
    });

    afterAll(async () => {
      await deleteImage(key);
    });

    it('should return 400 if image format is incorrect', async () => {
      const id = new Student()._id;
      const res = await exec(id, './tests/integration/assets/invalid.png');
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is larger than 1MB', async () => {
      const id = new Student()._id;
      const res = await exec(id, './tests/integration/assets/large.jpeg');
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is not provided', async () => {
      const id = new Student()._id;
      const res = await exec(id);
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is not provided', async () => {
      const id = new Student()._id;
      const res = await exec(id);
      expect(res.status).toBe(400);
    });

    it('should return 200 if image is valid', async () => {
      const res = await exec(
        student._id,
        './tests/integration/assets/valid.jpeg'
      );
      expect(res.status).toBe(200);
      const existence = await checkResourceExist(key);
      expect(existence).toBeTruthy();
    });

    it('should return 404 and delete the image if student not found', async () => {
      const newId = new Student()._id;
      const res = await exec(newId, './tests/integration/assets/valid.jpeg');
      expect(res.status).toBe(404);
      const existence = await checkResourceExist(`students/${newId}.jpeg`);
      expect(existence).toBeFalsy();
    });
  });

  describe('DELETE /:id', () => {
    const fields = {
      email: 'test@test.com',
      firstName: 'name',
      lastName: 'name'
    };
    const student = new Student(fields);

    const exec = id =>
      request(server)
        .delete(`/v1/students/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await student.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Student()._id;
      const res = await exec(id);
      expect(res.status).toBe(404);
    });

    it('should delete the document and remove the refs if object id exist', async () => {
      const courseId = 'CS123';
      await new Course({
        _id: courseId,
        name: 'Intro to C',
        students: [student._id]
      });
      const res = await exec(student._id);
      expect(res.status).toBe(200);

      expect(res.body.data).toMatchObject(fields);
      const studentDoc = await Student.findById(student._id);
      expect(studentDoc).toBeNull();

      const courseDoc = await Course.findOne({ students: student._id });
      expect(courseDoc).toBeNull();
    });
  });

  describe('POST /:id/courses/:code', () => {
    const student = {
      firstName: 'mason',
      lastName: 'test',
      email: 'test@test.com'
    };
    const courseDoc = new Course({
      _id: 'CSSE1001',
      name: 'intro to programming'
    });
    const studentDoc = new Student(student);
    const exec = (id, code) =>
      request(server)
        .post(`/v1/students/${id}/courses/${code}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await new Course(courseDoc).save();
      await studentDoc.save();
    });

    afterAll(async () => {
      await Course.findByIdAndDelete(courseDoc._id);
    });

    it('should return 404 if student does not exist', async () => {
      const studentId = new Student(student)._id;
      const res = await exec(studentId, courseDoc._id);
      expect(res.status).toBe(404);
    });

    it('should return 404 if course does not exist', async () => {
      const newCourse = {
        _id: 'CS213',
        name: 'intro to programming'
      };
      const res = await exec(studentDoc._id, newCourse._id);
      expect(res.status).toBe(404);
    });

    it('should return 201 if both course and student can be found', async () => {
      const res = await exec(studentDoc._id, courseDoc._id);
      expect(res.status).toBe(201);
    });
  });

  describe('DELETE /:id/courses/:code', () => {
    const student = {
      firstName: 'mason',
      lastName: 'test',
      email: 'test@test.com',
      courses: ['CSSE1001']
    };
    const studentDoc = new Student(student);
    const courseDoc = new Course({
      _id: 'CSSE1001',
      name: 'intro to programming',
      students: [studentDoc._id]
    });

    const exec = (id, code) =>
      request(server)
        .delete(`/v1/students/${id}/courses/${code}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await new Course(courseDoc).save();
      await studentDoc.save();
    });

    afterAll(async () => {
      await Course.findByIdAndDelete(courseDoc._id);
    });

    it('should return 404 if student does not exist', async () => {
      const studentId = new Student(student)._id;
      const res = await exec(studentId, courseDoc._id);
      expect(res.status).toBe(404);
    });

    it('should return 404 if course does not exist', async () => {
      const newCourse = {
        _id: 'CS213',
        name: 'intro to programming'
      };
      const res = await exec(studentDoc._id, newCourse._id);
      expect(res.status).toBe(404);
    });

    it('should return 200 if both course and student can be found and delete the refs', async () => {
      let course = await Course.findById(courseDoc._id);
      expect(course.students).toContain(studentDoc._id);
      const res = await exec(studentDoc._id, courseDoc._id);
      expect(res.status).toBe(200);
      course = await Course.findById(courseDoc._id);
      expect(course.students).not.toContain(studentDoc._id);
    });
  });
});
