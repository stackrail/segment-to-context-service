const { getUserContext } = require('../../src/db/queries/context.query');
const { getContextHandler } = require('../../src/api/controllers/context.controller');

jest.mock('../../src/db/queries/context.query');

describe('Context Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if tenant_id is missing', async () => {
    req.query = { user_id: 'user_1' };

    await getContextHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if user_id is missing', async () => {
    req.query = { tenant_id: 'tenant_1' };

    await getContextHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 if context not found', async () => {
    req.query = { tenant_id: 't1', user_id: 'u1' };

    getUserContext.mockResolvedValue(null);

    await getContextHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 200 with context data', async () => {
    req.query = { tenant_id: 't1', user_id: 'u1' };

    getUserContext.mockResolvedValue({
      tenant_id: 't1',
      user_id: 'u1',
      persona: 'test',
    });

    await getContextHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});

