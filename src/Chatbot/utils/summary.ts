/*const summarize_text = (post_url: string) => {
  return {description: "The post is about 3 main important steps in regulating your emotions when you are burned out.\nFirstly..."}
};

export { summarize_text };*/


import { API_ENDPOINTS } from '../../config/api.js';

const summarize_text = async (postTitle): Promise<string> => {
  console.log('I entered summary.ts summarize_text()')
  console.log(`this is what what inputted ${postTitle}`);
  if (typeof postTitle !== "string" || !postTitle.trim()) {
    throw new Error("summarize_text requires a non‑empty title string");
  }

  const encodedTitle = encodeURIComponent(postTitle.trim());
  const resp = await fetch(
    API_ENDPOINTS.POST_BY_TITLE(encodedTitle),
    {
      method:      "GET",
      credentials: "include"
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Failed to load post (${resp.status}): ${errText}`);
  }

  const post = await resp.json();
  console.log("This is what was returned", post.content);
  return post.content;
};

export { summarize_text };