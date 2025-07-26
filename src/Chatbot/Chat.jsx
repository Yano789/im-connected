import React from "react";
//import styles from "./page.css"; // use simple styles for demonstration purposes
import "./page.css";
import ChatWindow from "./components/chatWindow";
import { summarize_text } from "./utils/summary";
import Header from "../TopHeader/Header/Header";

const functionCallHandler = async (toolCall) => {
  // only handle your summary function
  if (toolCall.function.name !== "summarize_text") return;

  // parse out the URL
  const args = JSON.parse(toolCall.function.arguments);
  console.log('this is the args in Chat.jsx');
  console.log(args);

  // run your summarizer
  let summaryText;
  try {
    summaryText = await summarize_text(args.postTitle);
  } catch (err) {
    summaryText = `Error: ${err.message}`;
  }

  // return a JSON string matching the function schema
  console.log(`This is what the Chat.jsx functionCallHanlder()sees at the end ${summaryText}`);
  return JSON.stringify(summaryText);
};

const ChatPage = () => {
  return (
    <>
      <Header />
      <main className="main">
        <div className="container">
          <ChatWindow functionCallHandler={functionCallHandler}/>
        </div>
      </main>
    </>
  );
};

export default ChatPage;
