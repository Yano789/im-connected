import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  if (!openai) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant.",
    name: "Quickstart Assistant",
    model: "gpt-4o",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "summarize_text",
          description: "When the user asks to summarize a post, input the post title word for word into summarize_text() in utils/summary.ts. Then summarize the content returned from summarize_text() for the user.",
          parameters: {
            type: "object",
            properties: {
              "postTitle": {
                "type": "string",
                "description": "Title of the post to summarize information about"
              }
            },
            required: ["postTitle"]
          },
        }
      },
      { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
