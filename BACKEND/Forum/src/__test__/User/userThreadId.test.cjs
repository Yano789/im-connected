/*
Black‑box unit tests for  GET /api/v1/user/threadId
*/

const request = require('supertest');

/*
Mock auth middleware BEFORE app is imported 
*/
jest.mock('../../middleware/auth.cjs', () => {
  return (req, _res, next) => {
    req.currentUser = { username: 'mockUser' }; // what the route expects
    next();
  };
});
jest.mock("../../config/googleConfig.cjs", () => ({
  gcsClient: {
    url: jest.fn(async (publicId) => `http://example.com/${publicId}.jpg`),
  },
}));


/* Mock User model BEFORE app import*/
jest.mock('../../domains/user/model.cjs', () => ({
  findOne: jest.fn(), // will be stubbed per test
}));

/* import the app (will use the mocked modules above)*/
const app = require('../../app.cjs');
const UserModel = require('../../domains/user/model.cjs');

global.fetch = jest.fn(); // stub the quick‑start POST

const makeMockUser = (threadId) => ({
  username: 'mockUser',
  threadId,
  save: jest.fn(),
});

describe('GET /api/v1/user/threadId (chat‑bot feature)', () => {
  const agent = () =>
    request(app)
      .get('/api/v1/user/threadId')   // full mount path
      .set('Cookie', 'token=dummy');  // cookie presence only

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*TC‑1*/
  test('returns stored threadId when it exists', async () => {
    UserModel.findOne.mockResolvedValue(makeMockUser('T123'));

    const res = await agent();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ threadId: 'T123' });
    expect(global.fetch).not.toHaveBeenCalled(); //since threadId exist, no need to fetch openai to create threadId
  });

  /*TC‑2*/
  test('creates & saves new threadId when missing', async () => {
    const mockUser = makeMockUser(null);
    UserModel.findOne.mockResolvedValue(mockUser);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ threadId: 'T999' }),
    });

    const res = await agent();

    expect(res.statusCode).toBe(200);
    expect(res.body.threadId).toBe('T999');
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/assistants/threads",
      { method: 'POST' }
    );
    expect(mockUser.save).toHaveBeenCalled();
  });

  /*TC‑3*/
  test('returns 500 if quick‑start POST fails', async () => {
    UserModel.findOne.mockResolvedValue(makeMockUser(null));

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const res = await agent();

    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Could not read\/create threadId/i);
  });

  /*TC‑4*/
  test('returns 500 if DB save fails', async () => {
    const mockUser = makeMockUser(null);
    mockUser.save.mockRejectedValue(new Error('write conflict'));
    UserModel.findOne.mockResolvedValue(mockUser);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ threadId: 'T888' }),
    });

    const res = await agent();

    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Could not read\/create threadId/i);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
