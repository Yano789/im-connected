import React, { useState, useEffect, useRef } from "react";
import SendIcon from "../../assets/send-icon.png";
import UserAvatar from "../../assets/user-avatar.png";
import ChatBotIcon from "../../assets/ChatbotIcon.png";
import "./chatStyles.css";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
//import { AssistantStream } from "../../../BACKEND/AI_chatbot/openai-assistants-quickstart/node_modules/openai/lib/AssistantStream";
//import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
//import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
//import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

const UserMessage = ({ text }) => {
  return (
  <div className="userMessageRow">
      <div className="userBubble">{text}</div>
      <img
        src={UserAvatar}// Make sure this image is in your `public/` folder
        alt="User avatar"
        className="avatar"
      />
    </div>
  );
};

const AssistantMessage = ({ text }) => {
  return (
    <div className="assistantMessageRow">
        <img
        src={UserAvatar} // Make sure this image is in your `public/` folder
        alt="Assistant avatar"
        className="avatar"
      />
      <div className="assistantBubble">{text}</div>
      
    </div>
  );
};

const CodeMessage = ({ text }) => {
  return (
    <div className="codeMessage">
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

const ChatWindow = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new threadID when chat component created
  /*useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);*/
  useEffect(() => {
    // guard: only run in the browser
    if (typeof window === "undefined") return;

    //const saved = localStorage.getItem("threadId");
    const saved = "thread_MRJJrC53m6DmI8q2pNPipqRB";
    console.log("saved threadId from localStorage:", saved);
    if (saved) {
      // we found an existing thread—keep using it
      setThreadId(saved);
    } else {
      // no thread saved yet, so create one on the backend
      ; (async () => {
        const res = await fetch("http://localhost:3000/api/assistants/threads", { method: "POST" });
        const { threadId: newId } = await res.json();
        setThreadId(newId);
        console.log("🆕 created new threadId:", newId);
        localStorage.setItem("threadId", newId);
      })();
    }
  }, []);

  const sendMessage = async (text) => {
    const response = await fetch(
      `http://localhost:3000/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `http://localhost:3000/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    };
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  }

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });

  }

  return (
    <div>
      <div className="Title"> AI Chatbot <span className="Title2"> Companion </span></div>
      <div className="SubTitle"> safe, secure, anonymized </div>
      <div className="chatContainer">
        <div className="messages">
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.text} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="inputForm clearfix"
        >
          <input
            type="text"
            className="input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your question"
          />
          <button
            type="submit"
            className="button"
            disabled={inputDisabled}
          >
            <img
              src={SendIcon}
              alt="Send"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
