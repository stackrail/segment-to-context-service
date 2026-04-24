const request = require('supertest');
const app = require('../../src/index'); // 👈 IMPORTANT
const { flush } = require('../../src/utils/messageBroker');

describe('Events API', () => {
  afterEach(async () => {
    await flush(); // clean async jobs globally
  });

  it('should accept a valid event and return 202', async () => {
    const res = await request(app)
      .post('/events')
      .send({
        event_id: 'test_evt_1',
        tenant_id: 'tenant_1',
        user_id: 'user_1',
        payload: { action: 'click' },
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.event_id).toBe('test_evt_1');
  });

  it('should reject missing fields with 400', async () => {
    const res = await request(app)
      .post('/events')
      .send({});

    expect(res.statusCode).toBe(400);
  });
});

