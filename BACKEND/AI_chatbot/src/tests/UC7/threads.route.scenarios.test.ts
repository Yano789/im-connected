/*
UC7 
This integration test checks the route /api/assistants/threads/threadId/route.ts with OpenAI mocked

1) The happy path test reates a new thread via openai.beta.threads.create() and returns JSON { threadId } with expected CORS/JSON headers.

2) Error path test return error 500 when the OpenAI client is not configured

3) Error path test return error 500 when when openai.beta.threads.create() rejects request

To run test, run in AI_chatbot/src 'npx jest --config tests\jest.config.cjs UC7\threads.route.scenarios.test.ts --runInBand'
*/

type OpenAIShape = {
  beta: {
    threads: {
      create: jest.Mock;
    };
  };
} | null;

// Helper function to load mocks
function loadRouteWithMocks({ openaiMock }: { openaiMock: OpenAIShape }) {
  jest.resetModules();

  // Mock BEFORE requiring route
  jest.doMock("@/app/openai", () => ({ openai: openaiMock }));

  let POST: (req: Request) => Promise<Response>;
  let OPTIONS: (req: Request) => Promise<Response>;

  jest.isolateModules(() => {
    const mod = require("@/app/api/assistants/threads/route");
    POST = mod.POST;
    OPTIONS = mod.OPTIONS;
  });
  return { POST, OPTIONS };
}

function makeHappyOpenAI(id = "thread_xyz"): OpenAIShape {
  return {
    beta: {
      threads: {
        create: jest.fn().mockResolvedValue({ id }),
      },
    },
  } as unknown as OpenAIShape;
}

describe("UC7 threads route scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("happy path: creates a thread, should return threadId and CORS headers", async () => {
    const openai = makeHappyOpenAI("thread_abc123");
    const { POST } = loadRouteWithMocks({ openaiMock: openai });

    const req = new Request("http://localhost:3000/api/assistants/threads", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    // Content-Type and CORS header
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173");

    const json = await res.json();
    expect(json).toHaveProperty("threadId", "thread_abc123");

    const mockOpenAI = openai!;

    expect(mockOpenAI.beta.threads.create).toHaveBeenCalledTimes(1);
  });



  test("error: openai client not configured, should return error 500", async () => {
    const { POST } = loadRouteWithMocks({ openaiMock: null });

    const req = new Request("http://localhost:3000/api/assistants/threads", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);

    const json = await res.json();
    expect(json).toHaveProperty("error", "OpenAI API key not configured");
  });



  test("error: openai.threads.create rejected, should return error 500", async () => {
    const openai = {
      beta: {
        threads: {
          create: jest.fn().mockRejectedValue(new Error("OpenAI down")),
        },
      },
    } as unknown as OpenAIShape;

    const { POST } = loadRouteWithMocks({ openaiMock: openai });

    const req = new Request("http://localhost:3000/api/assistants/threads", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);

    const json = await res.json();
    expect(json).toHaveProperty("error", "Internal server error");
  });
});
