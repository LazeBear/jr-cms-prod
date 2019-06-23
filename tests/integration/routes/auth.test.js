const request = require('supertest');
const server = require('../../../src/server');
const { TEST_USER } = require('../../data');

describe('/v1/auth', () => {
  describe('POST /', () => {
    const exec = data =>
      request(server)
        .post('/v1/auth')
        .send(data);

    it('should return 400 if invalid email', async () => {
      const user = {
        password: '123456',
        email: 'test@'
      };
      const res = await exec(user);
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is less than 6 chars', async () => {
      const user = {
        password: '12345',
        email: 'test@test.com'
      };
      const res = await exec(user);
      expect(res.status).toBe(400);
    });

    it('should return 200 with token if all fields are valid', async () => {
      const { email, password } = TEST_USER;
      const res = await exec({ email, password });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 if incorrect password or email', async () => {
      const user = {
        password: '12345611111',
        email: TEST_USER.email
      };
      const res = await exec(user);
      expect(res.status).toBe(401);
    });
  });
});
