const { processEvent } = require('../../src/workers/event.worker');
const { insertEvent, getLastEvents } = require('../../src/db/queries/events.query');

jest.mock('../../src/db/queries/events.query');

describe('Event Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process event and store it', async () => {
    insertEvent.mockResolvedValue({ id: 1 });

    getLastEvents.mockResolvedValue([
      { event_id: 'evt_1' },
      { event_id: 'evt_2' }
    ]);

    const message = {
      event_id: 'test_1',
      tenant_id: 'tenant_1',
      user_id: 'user_1',
      payload: { action: 'click' }
    };

    await expect(processEvent(message)).resolves.toBeUndefined();

    expect(insertEvent).toHaveBeenCalled();
    expect(getLastEvents).toHaveBeenCalled();
  });

  it('should handle duplicate event gracefully', async () => {
    insertEvent.mockRejectedValue({ code: '23505' });

    const message = {
      event_id: 'dup_1',
      tenant_id: 'tenant_1',
      user_id: 'user_1',
      payload: {}
    };

    await expect(processEvent(message)).resolves.toBeUndefined();
  });
});

