export {};
/*
UC7 
This integration test checks the route /api/assistants/threads/threadId/messages/route.ts with OpenAI mocked

1) The happy path test verifies when user appends a message, starts a run, and returns an SSE-style stream with the expected streaming and CORS headers.

2) Error path test return error 500 when the OpenAI client is not configured

3) Error path test return error 500 when the assistantId is missing.

4) Error path test return error 500 when runs.stream throws midway after initial message success.

To run test, run in AI_chatbot/src 'npx jest --config tests\jest.config.cjs UC7\messages.route.scenarios.test.ts --runInBand'
*/
import { TextEncoder } from "node:util";

type OpenAIShape = { //sets shape for different tests
  beta: {
    threads: {
      messages: { create: jest.Mock };
      runs: { stream: jest.Mock };
    };
  };
} | null;

// Helper function to load mocks
function loadRouteWithMocks({
  openaiMock,
  assistantId = "asst_test_123",
}: { openaiMock: OpenAIShape; assistantId?: string }) {
  jest.resetModules(); // clear cache

  // Apply mocks before requiring route for next test
  jest.doMock("@/app/openai", () => ({ openai: openaiMock }));
  jest.doMock("@/app/assistant-config", () => ({ assistantId }));

  let POST: (req: Request, ctx?: any) => Promise<Response>; //shape for post request with context, params: {}
  let OPTIONS: (req: Request) => Promise<Response>; //shape for CORS preflight to check cross-origin

  // Import inside isolated module scope to load mocks in
  jest.isolateModules(() => {
    const mod = require("@/app/api/assistants/threads/[threadId]/messages/route");
    POST = mod.POST;
    OPTIONS = mod.OPTIONS;
  });

  return { POST, OPTIONS };
}

// Mock stream object for happy path
function makeHappyOpenAI() {
  const sseText = [
    "event: textCreated\n",
    'data: {"id":"tx_1"}\n\n',
    "event: textDelta\n",
    'data: {"delta":{"type":"output_text_delta","value":"Translated: Hello"}}\n\n',
    "event: thread.run.completed\n",
    "data: {}\n\n",
  ].join("");

  const encoder = new TextEncoder();
  const streamBody = encoder.encode(sseText);

  const openai = {
    beta: {
      threads: {
        messages: {
          create: jest.fn().mockResolvedValue({ id: "msg_1" }),
        },
        runs: {
          stream: jest.fn().mockReturnValue({
            toReadableStream: () =>
              new ReadableStream({
                start(controller) {
                  controller.enqueue(streamBody);
                  controller.close();
                },
              }),
          }),
        },
      },
    },
  };

  return openai as unknown as OpenAIShape;//lets typescript ignore non-compliance with shape first
}

describe("UC7 messages route scenario tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("happy path should return SSE stream", async () => {
    const openai = makeHappyOpenAI();
    const { POST } = loadRouteWithMocks({ openaiMock: openai });

    const threadId = "thread_abc123";
    const req = new Request(
      `http://localhost:3000/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({ content: "Please translate 'Hola' to english." }),
      }
    );

    const res = await POST(req as any, { params: { threadId } } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    expect(res.headers.get("Cache-Control")).toMatch(/no-cache/);
    expect(res.headers.get("Connection")).toMatch(/keep-alive/);

    const text = await res.text();
    expect(text).toContain("event: textCreated");
    expect(text).toContain("thread.run.completed");

    // Verify OpenAI was called correctly
    const mockOpenAI = openai!;
    expect(
      mockOpenAI.beta.threads.messages.create
    ).toHaveBeenCalledWith(threadId, expect.any(Object));
    expect(
      mockOpenAI.beta.threads.runs.stream
    ).toHaveBeenCalledWith(
      threadId,
      expect.objectContaining({ assistant_id: expect.any(String) })
    );
  });



  test("error: openai client not configured, should return error 500", async () => {
    // null triggers the 'API key not configured' branch
    const { POST } = loadRouteWithMocks({ openaiMock: null });

    const req = new Request(
      "http://localhost:3000/api/assistants/threads/t1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({ content: "Please translate 'Hola' to english." }),
      }
    );

    const res = await POST(req as any, { params: { threadId: "t1" } } as any);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    const json = await res.json();
    expect(json).toHaveProperty("error", "OpenAI API key not configured");
  });



  test("error: assistantId missing should return error 500", async () => {
    const openai = makeHappyOpenAI();
    // Provide empty assistantId to trigger that branch
    const { POST } = loadRouteWithMocks({ openaiMock: openai, assistantId: "" });

    const req = new Request(
      "http://localhost:3000/api/assistants/threads/t1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({ content: "Please translate 'Hola' to english." }),
      }
    );

    const res = await POST(req as any, { params: { threadId: "t1" } } as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Assistant ID not configured");
  });



  test("error: stream crashes after initial success should return error 500", async () => {
    const openai = {
      beta: {
        threads: {
          messages: { create: jest.fn().mockResolvedValue({ id: "msg_1" }) },
          runs: {
            stream: jest.fn(() => {
              throw new Error("stream boom");
            }),
          },
        },
      },
    } as unknown as OpenAIShape;

    const { POST } = loadRouteWithMocks({ openaiMock: openai });

    const req = new Request(
      "http://localhost:3000/api/assistants/threads/t1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({ content: "Please translate 'Hola' to english." }),
      }
    );

    const res = await POST(req as any, { params: { threadId: "t1" } } as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Internal server error");
  });
});
