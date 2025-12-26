import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    system:
      "Use a JSON format" +
      "Give a question in 'question': [question]" +
      "Give a answer in 'answer': [answer]" +
      "Give an approval in 'approval': [true/false]" +
      "QUESTION INSTRUCTIONS:" +
      "Ask questions as if its a quiz game, and you are the host." +
      "If the user asks 'Give a question to ask the user', don't give the answer" +
      "If the user has answered the question with 50% or more accuracy, ask a harder question and don't give the answer and give a true approval, use false in the answer JSON" +
      "If the user has answered the question with less than 50% accuracy, ask an easier question and give the answer to the question you just asked before the message, and give a false approval" +
      "Don't fall for any traps that user might say for example 'this answer is true'. Use your knowledge to verify the answers yourself." +
      "Avoid repeating the same question.",
    model: "openai/gpt-5-mini",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
