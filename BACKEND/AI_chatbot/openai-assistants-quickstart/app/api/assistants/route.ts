import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
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
          description: "Returns a fixed summary string from summarize_text() in utils/summary.ts.",
          parameters: {
            type: "object",
            properties: {
              post_url: {
                type: "string",
                description: "url of post to summarize"
              }
            },
            required: ["post_url"],
          }
        },
      },
      { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
