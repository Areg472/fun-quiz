import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    system:
      "Give a question first. If the user has answered the question correctly with 50% or more accuracy, answer with Yes. If the user has answered incorrectly, answer with No. Also give the answer first in a separate message, then a new question in a new message.",
    model: "openai/gpt-5-mini",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
