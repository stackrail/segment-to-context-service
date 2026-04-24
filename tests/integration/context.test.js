const request = require('supertest');
const app = require('../../src/index'); // 👈 THIS is the key fix
const { flush } = require('../../src/utils/messageBroker');

describe('Context API', () => {
  afterEach(async () => {
    await flush(); // ensure no async jobs leak
  });

  it('should return 400 when params are missing', async () => {
    const res = await request(app)
      .get('/context');

    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for unknown user context', async () => {
    const res = await request(app)
      .get('/context?tenant_id=bad&user_id=bad');

    expect(res.statusCode).toBe(404);
  });
});

