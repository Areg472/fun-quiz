"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";

export default function AIStuff() {
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [notApprovedCount, setNotApprovedCount] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const isFirstResponse = useRef(true);
  const { messages, sendMessage, status } = useChat({
    onFinish: ({ message }) => {
      const firstPart = message.parts.find((part) => part.type === "text");
      if (firstPart && firstPart.type === "text") {
        const text = firstPart.text.trim();

        console.log("AI Response:", text);

        try {
          const parsed = JSON.parse(text);

          if (parsed.question) {
            setCurrentQuestion(parsed.question);
          }

          if (parsed.approval !== undefined) {
            const approved =
              parsed.approval === true || parsed.approval === "true";
            setIsApproved(approved);

            if (!isFirstResponse.current) {
              if (approved) {
                setApprovedCount((prev) => prev + 1);
              } else {
                setNotApprovedCount((prev) => prev + 1);
              }
            }
          }

          if (parsed.answer) {
            setCurrentAnswer(parsed.answer);
          }

          isFirstResponse.current = false;
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }
      setIsWaiting(false);
    },
  });

  useEffect(() => {
    sendMessage({ text: "Give a question to ask the user" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-2xl">
        <div className="border-2 border-white rounded-3xl p-12 bg-black">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {currentQuestion || "Pending question..."}
            </h1>
          </div>

          <div className="flex justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                  setIsApproved(false);
                  setIsWaiting(true);
                  setCurrentAnswer("");
                }
              }}
              className="w-full max-w-md"
            >
              <input
                className="w-full p-4 text-center border-2 border-white rounded-xl bg-black text-white text-lg placeholder-gray-400"
                value={input}
                placeholder="Answer here"
                onChange={(e) => setInput(e.currentTarget.value)}
                disabled={isWaiting || status === "streaming"}
              />
            </form>
          </div>

          <div className="mt-8 flex justify-center gap-8 text-white">
            <div className="text-center">
              <div className="text-2xl">✅ {approvedCount}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">❌ {notApprovedCount}</div>
            </div>
          </div>

          {(isWaiting || status === "streaming") && (
            <div className="mt-6 text-center text-white text-xl">
              ⏳ Waiting...
            </div>
          )}

          {currentAnswer && (
            <div className="mt-6 p-4 bg-yellow-900 rounded-xl text-center text-white">
              <strong>Previous Answer:</strong> {currentAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
