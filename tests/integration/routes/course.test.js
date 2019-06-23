const request = require('supertest');
const Student = require('../../../src/models/student');
const Course = require('../../../src/models/course');
const Teacher = require('../../../src/models/teacher');
const server = require('../../../src/server');
const { TOKEN } = require('../../data');
const {
  deleteImage,
  checkResourceExist
} = require('../../../src/utils/upload');

beforeAll(async () => {
  await Course.deleteMany({});
});

describe('/v1/courses', () => {
  describe('GET /', () => {
    const courses = [
      {
        _id: 'ABC1',
        name: 'A1'
      },
      {
        _id: 'ABC2',
        name: 'A3'
      },
      {
        _id: 'ABC3',
        name: 'A2'
      }
    ];
    const exec = query =>
      request(server)
        .get(`/v1/courses${query ? `?${query}` : ''}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await Course.insertMany(courses);
    });

    afterAll(async () => {
      await Course.deleteMany({});
    });

    it('should return all courses', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should return 2 courses with pageSize=1', async () => {
      const res = await exec('pageSize=1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(1);
    });

    it('should return 2 courses with pagination', async () => {
      const res = await exec('page=1&pageSize=2');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
    });

    it('should return 1 course with search key', async () => {
      const res = await exec('q=c1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]).toMatchObject(courses[0]);
    });

    it('should return correct order with single key sort', async () => {
      const res = await exec('sort=name');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0]).toMatchObject(courses[0]);
      expect(res.body.data[1]).toMatchObject(courses[2]);
      expect(res.body.data[2]).toMatchObject(courses[1]);
    });
  });

  describe('POST /', () => {
    const exec = body =>
      request(server)
        .post(`/v1/courses`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(body);

    it('should return 400 if name is missing', async () => {
      const course = {
        code: 'CSS1'
      };
      const res = await exec(course);
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 2 chars', async () => {
      const course = {
        code: 'CSS1',
        name: 'a'
      };
      const res = await exec(course);
      expect(res.status).toBe(400);
    });

    it('should return 201 if all fields are valid', async () => {
      const course = {
        code: 'CSS1',
        name: 'app'
      };
      const res = await exec(course);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /:id', () => {
    const fields = {
      code: 'CSS2',
      name: 'app'
    };
    const course = new Course(fields);

    const exec = id =>
      request(server)
        .get(`/v1/courses/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await course.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Course()._id;
      const res = await exec(id);
      expect(res.status).toBe(404);
    });

    it('should return 200 if object id exist', async () => {
      const res = await exec(course._id);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(fields);
    });
  });

  describe('PUT /:id', () => {
    const fields = {
      code: 'APP123',
      name: 'app'
    };
    const course = new Course(fields);

    const exec = (id, body) =>
      request(server)
        .put(`/v1/courses/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(body);

    beforeAll(async () => {
      await course.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Course()._id;
      const res = await exec(id, {});
      expect(res.status).toBe(404);
    });

    it('should update the document if object id exist', async () => {
      const newDoc = {
        name: 'new app'
      };
      const res = await exec(course._id, newDoc);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(newDoc);
    });

    it('should return 400 if the update object is invalid', async () => {
      const newDoc = {
        name: 'n'
      };
      const res = await exec(course._id, newDoc);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id/image', () => {
    const courseId = 'CS31S';
    const key = `courses/${courseId}.jpeg`;
    const course = new Course({
      _id: courseId,
      name: 'app'
    });

    const exec = (id, file) =>
      request(server)
        .put(`/v1/courses/${id}/image`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .attach('image', file);

    beforeAll(async () => {
      await course.save();
    });

    afterAll(async () => {
      await deleteImage(key);
    });

    it('should return 400 if image format is incorrect', async () => {
      const id = new Course()._id;
      const res = await exec(id, './tests/integration/assets/invalid.png');
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is larger than 1MB', async () => {
      const id = new Course()._id;
      const res = await exec(id, './tests/integration/assets/large.jpeg');
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is not provided', async () => {
      const id = new Course()._id;
      const res = await exec(id);
      expect(res.status).toBe(400);
    });

    it('should return 400 if image is not provided', async () => {
      const id = new Course()._id;
      const res = await exec(id);
      expect(res.status).toBe(400);
    });

    it('should return 200 if image is valid', async () => {
      const res = await exec(
        course._id,
        './tests/integration/assets/valid.jpeg'
      );
      expect(res.status).toBe(200);
      const existence = await checkResourceExist(key);
      expect(existence).toBeTruthy();
    });

    it('should return 404 and delete the image if course not found', async () => {
      const newId = new Course()._id;
      const res = await exec(newId, './tests/integration/assets/valid.jpeg');
      expect(res.status).toBe(404);
      const existence = await checkResourceExist(`courses/${newId}.jpeg`);
      expect(existence).toBeFalsy();
    });
  });

  describe('DELETE /:id', () => {
    const fields = {
      code: 'APP1',
      name: 'app'
    };
    const course = new Course(fields);

    const exec = id =>
      request(server)
        .delete(`/v1/courses/${id}`)
        .set('Authorization', `Bearer ${TOKEN}`);

    beforeAll(async () => {
      await course.save();
    });

    it('should return 404 if object id not exist', async () => {
      const id = new Course()._id;
      const res = await exec(id);
      expect(res.status).toBe(404);
    });

    it('should delete the document and remove the refs if object id exist', async () => {
      await new Student({
        firstName: 'Ab',
        lastName: 'Bb',
        email: 'test@test.com',
        courses: [course._id]
      }).save();
      await new Teacher({
        firstName: 'Ab',
        lastName: 'Bb',
        email: 'test@test.com',
        courses: [course._id]
      }).save();
      const res = await exec(course._id);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(fields);

      const studentDoc = await Student.findOne({ courses: course._id });
      expect(studentDoc).toBeNull();

      const teacherDoc = await Teacher.findOne({ courses: course._id });
      expect(teacherDoc).toBeNull();
    });
  });
});
