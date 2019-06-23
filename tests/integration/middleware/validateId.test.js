const request = require('supertest');

const server = require('../../../src/server');
const { TOKEN } = require('../../data');

describe('validate id', () => {
  it('should return 400 if id is invalid format', async () => {
    const res = await request(server)
      .get('/v1/students/123132')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(400);
  });
});
