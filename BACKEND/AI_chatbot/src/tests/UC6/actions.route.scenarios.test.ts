export {};
/*
UC6
This integration test checks the route /api/assistants/threads/threadId/actions/route.ts with OpenAI and the frontend summary.ts mocked

1) The happy path test checks the smooth flow of tool call message -> action call -> mocked summary.ts output -> stream completed to OpenAi

2) Multiple tool calls should be forwarded to OpenAI in exact order

3) Error path test return error 500 when the OpenAI client is not configured

4) Error path test return error 500 when when submitToolOutputsStream is interrupted midway

To run test, run in AI_chatbot/src 'npx jest --config tests\jest.config.cjs UC6\actions.route.scenarios.test.ts --runInBand'
*/
import { TextEncoder } from "node:util";

type OpenAIShape =
  | {
      beta: {
        threads: {
          messages: { create: jest.Mock };
          runs: {
            stream: jest.Mock;
            submitToolOutputsStream: jest.Mock;
          };
        };
      };
    }
  | null;

//Helper function to load mocks
function loadMessagesRouteWithMocks({
  openaiMock,
  assistantId = "asst_test_123",
}: { openaiMock: OpenAIShape; assistantId?: string }) {
  jest.resetModules();
  jest.doMock("@/app/openai", () => ({ openai: openaiMock }));
  jest.doMock("@/app/assistant-config", () => ({ assistantId }));

  let POST!: (req: Request, ctx: { params: { threadId: string } }) => Promise<Response>;
  let OPTIONS!: (req: Request) => Promise<Response>;

  jest.isolateModules(() => {
    const mod = require("@/app/api/assistants/threads/[threadId]/messages/route");
    POST = mod.POST;
    OPTIONS = mod.OPTIONS;
  });

  return { POST, OPTIONS };
}

function loadActionsRouteWithMocks({ openaiMock }: { openaiMock: OpenAIShape }) {
  jest.resetModules();
  jest.doMock("@/app/openai", () => ({ openai: openaiMock }));

  let POST!: (req: Request, ctx: { params: { threadId: string } }) => Promise<Response>;
  let OPTIONS!: (req: Request) => Promise<Response>;

  jest.isolateModules(() => {
    const mod = require("@/app/api/assistants/threads/[threadId]/actions/route");
    POST = mod.POST;
    OPTIONS = mod.OPTIONS;
  });

  return { POST, OPTIONS };
}

//SSE tool stream helper functions
const enc = new TextEncoder();

function makeRequiresActionSSE({
  runId = "run_123",
  toolCallId = "call_1",
  args = { text: "Long text to summarize..." },
} = {}) {
  const payload = {
    id: runId,
    required_action: {
      type: "submit_tool_outputs",
      submit_tool_outputs: {
        tool_calls: [
          {
            id: toolCallId,
            type: "function",
            function: { name: "summary", arguments: JSON.stringify(args) },
          },
        ],
      },
    },
  };
  const sse = [
    "event: thread.run.requires_action\n",
    `data: ${JSON.stringify(payload)}\n\n`,
  ].join("");
  return enc.encode(sse);
}

function makeCompletionSSE() {
  const sse = [
    "event: textDelta\n",
    'data: {"delta":{"type":"output_text_delta","value":"Here is your summary..."}}\n\n',
    "event: thread.run.completed\n",
    "data: {}\n\n",
  ].join("");
  return enc.encode(sse);
}


describe("UC6 actions route scenario tests", () => {
  beforeEach(() => jest.clearAllMocks());

  test("happy path: messages -> tool call -> mock summary.ts -> action -> stream complete", async () => {
    const requiresActionBody = makeRequiresActionSSE();
    const completionBody = makeCompletionSSE();

    //shared OpenAI mock for message and action
    const openai: OpenAIShape = {
      beta: {
        threads: {
          messages: { create: jest.fn().mockResolvedValue({ id: "msg_1" }) },
          runs: {
            stream: jest.fn().mockReturnValue({
              toReadableStream: () =>
                new ReadableStream({
                  start(c) {
                    c.enqueue(requiresActionBody);
                    c.close();
                  },
                }),
            }),
            submitToolOutputsStream: jest.fn().mockReturnValue({
              toReadableStream: () =>
                new ReadableStream({
                  start(c) {
                    c.enqueue(completionBody);
                    c.close();
                  },
                }),
            }),
          },
        },
      },
    };

    // Call messages route, requires_action stream
    const { POST: messagesPOST } = loadMessagesRouteWithMocks({
      openaiMock: openai,
      assistantId: "asst_test_123",
    });

    const threadId = "thread_uc6";
    const req1 = new Request(
      `http://localhost:3000/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
        body: JSON.stringify({ content: "Summarize this post for me please 'post_title'" }),
      }
    );

    const res1 = await messagesPOST(req1 as any, { params: { threadId } } as any);
    expect(res1.status).toBe(200);
    expect(res1.headers.get("Content-Type")).toMatch(/text\/plain/);
    const sseText1 = await res1.text();
    expect(sseText1).toContain("thread.run.requires_action");

    // Extract runId & tool_call_id from SSE
    const match = sseText1.match(/data:\s*(\{.*\})/);
    expect(match).toBeTruthy();
    const requiresActionJson = JSON.parse(match![1]);
    const runId = requiresActionJson.id as string;
    const toolCallId =
      requiresActionJson.required_action.submit_tool_outputs.tool_calls[0].id as string;

    // Mock summary.ts result from frontend
    jest.resetModules();
    jest.doMock(
      "../../../../src/Chatbot/utils/summary.ts",
      () => ({ summarize: jest.fn().mockResolvedValue("MOCK_SUMMARY_RESULT") }),
      { virtual: true }
    );
    const { summarize } = require("../../../../src/Chatbot/utils/summary.ts");
    const toolOutputStr: string = await summarize("any");
    expect(toolOutputStr).toBe("MOCK_SUMMARY_RESULT");

    // Build toolCallOutputs like client
    const toolCallOutputs = [{ tool_call_id: toolCallId, output: toolOutputStr }];

    // Call actions route, submit tool outputs
    const { POST: actionsPOST } = loadActionsRouteWithMocks({ openaiMock: openai });
    const req2 = new Request(
      `http://localhost:3000/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
        body: JSON.stringify({ runId, toolCallOutputs }),
      }
    );

    const res2 = await actionsPOST(req2 as any, { params: { threadId } } as any);
    expect(res2.status).toBe(200);
    expect(res2.headers.get("Content-Type")).toMatch(/text\/plain/);
    expect(res2.headers.get("Cache-Control")).toMatch(/no-cache/);
    expect(res2.headers.get("Connection")).toMatch(/keep-alive/);

    const sseText2 = await res2.text();
    expect(sseText2).toContain("event: textDelta");
    expect(sseText2).toContain("thread.run.completed");

    // Ensure OpenAI submitToolOutputsStream was called with tool_outputs
    expect(openai!.beta.threads.runs.submitToolOutputsStream).toHaveBeenCalledWith(
      threadId,
      runId,
      expect.objectContaining({
        tool_outputs: expect.any(Array),
      })
    );
  });



  test("multiple toolCallOutputs are forwarded as tool_outputs, should return all tool outputs in correct order", async () => {
    const completionBody = makeCompletionSSE();
    const openai: OpenAIShape = {
      beta: {
        threads: {
          messages: { create: jest.fn() },
          runs: {
            stream: jest.fn(),
            submitToolOutputsStream: jest.fn().mockReturnValue({
              toReadableStream: () =>
                new ReadableStream({
                  start(c) {
                    c.enqueue(completionBody);
                    c.close();
                  },
                }),
            }),
          },
        },
      },
    };

    const { POST: actionsPOST } = loadActionsRouteWithMocks({ openaiMock: openai });

    const threadId = "thread_uc6_map";
    const runId = "run_map";
    const toolCallOutputs = [
      { tool_call_id: "call_1", output: "A" },
      { tool_call_id: "call_2", output: "B" },
    ];

    const req = new Request(
      `http://localhost:3000/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
        body: JSON.stringify({ runId, toolCallOutputs }),
      }
    );
    const res = await actionsPOST(req as any, { params: { threadId } } as any);
    expect(res.status).toBe(200);

    // Verify mapping to tool_outputs and order preservation
    const call = (openai as any).beta.threads.runs.submitToolOutputsStream.mock.calls[0];
    expect(call[0]).toBe(threadId);
    expect(call[1]).toBe(runId);
    const thirdArg = call[2];
    expect(Array.isArray(thirdArg.tool_outputs)).toBe(true);
    expect(thirdArg.tool_outputs).toHaveLength(2);
    expect(thirdArg.tool_outputs[0]).toEqual({ tool_call_id: "call_1", output: "A" });
    expect(thirdArg.tool_outputs[1]).toEqual({ tool_call_id: "call_2", output: "B" });
  });



  test("ERROR: openai client not configured, should return error 500", async () => {
    const { POST: actionsPOST } = loadActionsRouteWithMocks({ openaiMock: null });
    const req = new Request(
      "http://localhost:3000/api/assistants/threads/t/actions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
        body: JSON.stringify({ runId: "x", toolCallOutputs: [] }),
      }
    );
    const res = await actionsPOST(req as any, { params: { threadId: "t" } } as any);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });



  test("ERROR: submitToolOutputsStream interrupted midway, should return error 500", async () => {
    const openai: OpenAIShape = {
      beta: {
        threads: {
          messages: { create: jest.fn() },
          runs: {
            stream: jest.fn(),
            submitToolOutputsStream: jest.fn(() => {
              throw new Error("submit failed");
            }),
          },
        },
      },
    };

    const { POST: actionsPOST } = loadActionsRouteWithMocks({ openaiMock: openai });
    const req = new Request(
      "http://localhost:3000/api/assistants/threads/t/actions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
        body: JSON.stringify({
          runId: "run_boom",
          toolCallOutputs: [{ tool_call_id: "call_1", output: "x" }],
        }),
      }
    );
    const res = await actionsPOST(req as any, { params: { threadId: "t" } } as any);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Internal server error");
  });
});
