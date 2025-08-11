import React, { useState, useEffect, useRef } from "react";
import SendIcon from "../../assets/send-icon.png";
import UserAvatar from "../../assets/user-avatar.png";
import ChatBotIcon from "../../assets/ChatbotIcon.png";
import "./chatWindow.css";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";


const UserMessage = ({ text }) => {
  return (
    <div className="userMessageRow">
      <div className="userBubble">{text}</div>
      <img
        src={UserAvatar}
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
        src={ChatBotIcon}
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

  const {t} = useTranslation();
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState(null);
  //const [language, setLanguage] = useState(null);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    //console.log('the useEffect triggered');

    (async () => {
      try {
        /*ask the user route for current threadId */
        //console.log('before fetching');
        const res = await fetch(
          API_ENDPOINTS.USER_THREAD_ID,
          { method: "GET", credentials: "include" }
        );
        //console.log('after fetching', res.status);
        if (!res.ok) throw new Error(await res.text());
        const { threadId: existing } = await res.json();

        if (existing) {
          // already stored on the server
          console.log(`retrieved existing threadId, it is ${existing}`)
          setThreadId(existing);
          //return;
        }

      } catch (err) {
        console.error("Thread‑ID flow error:", err.message);
      }
      /*try {
        const langRes = await fetch(
          API_ENDPOINTS.USER_LANGUAGE,
          { method: "GET", credentials: "include" }
        );
        if (!langRes.ok) {
            throw new Error('Failed to fetch language: ' + await langRes.text());
          }
        const { language } = await langRes.json();
        console.log(`retrieved preferredLanguage: ${language}`);
        setPreferredLanguage(language);
      } catch (err) {
        console.error("Language retrieval error:", err.message);
      }*/
    })();
  }, []);

  const sendMessage = async (text) => {
    // Check if AI chatbot service is available
    if (!API_ENDPOINTS.AI_CHATBOT_THREADS(threadId)) {
      console.error('AI Chatbot API is not available in this environment');
      // Add a message to the chat indicating the service is unavailable
      appendMessage("assistant", "I'm sorry, but the AI chatbot service is currently unavailable. Please try again later or contact support.");
      setInputDisabled(false);
      return;
    }

    const response = await fetch(
      API_ENDPOINTS.AI_CHATBOT_THREADS(threadId),
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
    // Check if AI chatbot service is available
    if (!API_ENDPOINTS.AI_CHATBOT_ACTIONS(threadId)) {
      console.error('AI Chatbot API is not available in this environment');
      setInputDisabled(false);
      return;
    }

    const response = await fetch(
      API_ENDPOINTS.AI_CHATBOT_ACTIONS(threadId),
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
    event) => {
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

  /* Utility Helpers */

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
      <div className="Title"> {t("AI Chatbot")} <span className="Title2"> {t("Companion")} </span></div>
      <div className="SubTitle"> {t("Safe")} </div>
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
            placeholder={t("Enter your question")}
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
