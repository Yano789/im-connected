import React from "react";
import {
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

//Stub out scrollIntoView
beforeAll(() => {
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
});

// Mock the AssistantStream so no real OpenAI code runs
vi.mock("openai/lib/AssistantStream.mjs", () => ({
  AssistantStream: {
    fromReadableStream: () => ({
      on: (eventName, cb) => {
        if (eventName === "textCreated") {
          // start a new assistant bubble
          cb();
        }
        if (eventName === "textDelta") {
          // fill it with "Hello!"
          cb({ value: "Hello!" });
        }
        if (eventName === "event") {
          // signal run completed so input re‑enables
          cb({ event: "thread.run.completed" });
        }
      },
    }),
  },
}));

// Import the real ChatWindow UI 
import ChatWindow from "../Chatbot/components/chatWindow";

/** Helper to fake a fetch Response for JSON routes **/
const jsonResponse = (data, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => data,
});

describe("ChatWindow component", () => {
  let fetchSpy;

  beforeEach(() => {
    // spy on all global.fetch calls
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.clearAllMocks();
  });



  /*TC‑1*/
  it("Initial render: send button enabled & no messages", async () => {
    // 1st fetch GET /threadId
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ threadId: "T555" })
    );

    render(<ChatWindow />);
    const sendBtn = screen.getByRole("button", { name: /send/i });

    // wait for the GET-threadId call
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    // button should be enabled (initial state)
    expect(sendBtn).toBeEnabled();
    // no messages yet
    expect(screen.queryByRole("listitem")).toBeNull();
  });



  /*TC‑2*/
  it("Send‑message success: shows user + assistant bubbles", async () => {
    // GET /threadId
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ threadId: "T555" })
    );
    // POST /threads/T555/messages → we only care that body exists
    fetchSpy.mockResolvedValueOnce(
      //response.body is ignored by AssistantStream mock
      { body: {} }
    );

    render(<ChatWindow />);
    const input = screen.getByPlaceholderText(/enter your question/i);
    const sendBtn = screen.getByRole("button", { name: /send/i });
    const user = userEvent.setup();

    // type & send
    await user.type(input, "Hi");
    await user.click(sendBtn);

    //AssistantStream mock immediately emits "Hello!"
    await screen.findByText("Hello!");
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Hello!")).toBeInTheDocument();
    // after run‑completed, input should be re‑enabled
    expect(sendBtn).toBeEnabled();
  });



  /*TC‑3*/
  it("Bootstrap uses fetched threadId in POST URL", async () => {
    // GET /threadId
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ threadId: "T555" })
    );
    // POST
    fetchSpy.mockResolvedValueOnce({ body: {} });

    render(<ChatWindow />);
    const sendBtn = screen.getByRole("button", { name: /send/i });
    const input = screen.getByPlaceholderText(/enter your question/i);

    // confirm the GET happened correctly
    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/user/threadId"),
        expect.any(Object)
      )
    );

    const user = userEvent.setup();
    await user.type(input, "Ping");
    await user.click(sendBtn);

    // confirm the POST went to /threads/T555/messages
    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/threads\/T555\/messages/),
        expect.objectContaining({ method: "POST" })
      )
    );
  });
});
