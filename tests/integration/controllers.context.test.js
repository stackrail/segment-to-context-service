const request = require('supertest');

describe('Context Controller', () => {

  it('should return 400 when tenant_id is missing', async () => {
    const res = await request('http://localhost:3000')
      .get('/context?user_id=user_1');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 when user_id is missing', async () => {
    const res = await request('http://localhost:3000')
      .get('/context?tenant_id=tenant_1');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 404 for non-existing context', async () => {
    const res = await request('http://localhost:3000')
      .get('/context?tenant_id=bad&user_id=bad');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBeDefined();
  });

});

