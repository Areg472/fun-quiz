import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    system:
      "Give a question first. If the user has answered the question correctly with 50% or more accuracy, answer with Yes. If the user has answered incorrectly, answer with No. Also give the answer first in a separate message, then a new question in a new message." +
      "If the user says 'Give a question to ask the user' then respond with No, dont reveal any answers, and give a question." +
      "The questions shall be general, about the stuff that most humans know, and not about their personal lives. Some questions can be harder, but it should be something that humans know.",
    model: "openai/gpt-5-mini",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
