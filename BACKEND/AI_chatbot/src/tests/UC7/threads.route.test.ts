// Tests api/assistants/threads/route.ts
//npx jest --config tests\jest.config.cjs UC7\threads.route.test.ts --runInBand
const mockOpenAI = {
  beta: {
    threads: {
      create: jest.fn().mockResolvedValue({ id: "thread_xyz" }),
    },
  },
};

jest.mock("@/app/openai", () => ({
  openai: mockOpenAI,
}));

import { POST } from "@/app/api/assistants/threads/route";

describe("Threads route -> create thread (OpenAI mocked)", () => {
  it("returns a new threadId", async () => {
    const req = new Request("http://localhost:3000/api/assistants/threads", {
      method: "POST",
      headers: {
        "Origin": "http://localhost:5173",
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173");
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    expect(data).toHaveProperty("threadId", "thread_xyz");
    expect(mockOpenAI.beta.threads.create).toHaveBeenCalled();
  });

  it("returns 500 when OpenAI.create() fails", async () => {
    mockOpenAI.beta.threads.create.mockRejectedValueOnce(new Error("OpenAI down"));

    const req = new Request("http://localhost:3000/api/assistants/threads", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toHaveProperty("error"); //Console: AI Chatbot Thread Creation, return Error: "Internal server error"
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173");
  });

});

