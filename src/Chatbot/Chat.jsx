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

  // run your summarizer
  const summaryText = summarize_text(args.post_url);

  // return a JSON string matching the function schema
  console.log(summaryText);
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
