const { insertEvent } = require('../../src/db/queries/events.query');
const { createEvent } = require('../../src/api/controllers/events.controller');

jest.mock('../../src/db/queries/events.query');

describe('Events Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if missing fields', async () => {
    req.body = {};

    await createEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should accept valid event', async () => {
    req.body = {
      event_id: 'e1',
      tenant_id: 't1',
      user_id: 'u1',
      payload: {},
    };

    insertEvent.mockResolvedValue({});

    await createEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('should handle duplicate event gracefully', async () => {
    req.body = {
      event_id: 'dup',
      tenant_id: 't1',
      user_id: 'u1',
      payload: {},
    };

    insertEvent.mockRejectedValue({ code: '23505' });

    await createEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(202);
  });
});

