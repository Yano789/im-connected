"use client";

import React from "react";
import styles from "./page.module.css"; // use simple styles for demonstration purposes
import Chat from "./components/chat";
import { summarize_text } from "./utils/summary";

const functionCallHandler = async (toolCall: {
  function: { name: string; arguments: string };
}) => {
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

const Home = () => {
  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <main className={styles.main}>
        <div className={styles.container}>
          <Chat functionCallHandler={functionCallHandler} />

        </div>
      </main>
    </>
  );
};

export default Home;
