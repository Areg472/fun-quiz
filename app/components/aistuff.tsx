"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";

export default function AIStuff() {
  const [input, setInput] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [notApprovedCount, setNotApprovedCount] = useState(0);
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const { messages, sendMessage, status } = useChat({
    onFinish: ({ message }) => {
      const firstPart = message.parts.find((part) => part.type === "text");
      if (firstPart && firstPart.type === "text") {
        const text = firstPart.text.trim();
        const first3Chars = text.substring(0, 3).toUpperCase();

        console.log("AI Response:", text);
        console.log("First 3 chars:", first3Chars);

        if (first3Chars.includes("YES")) {
          console.log("Setting approved to TRUE");
          setIsApproved(true);
          if (!isFirstResponse) {
            setApprovedCount((prev) => prev + 1);
          }
        } else if (first3Chars.includes("NO")) {
          console.log("Setting approved to FALSE");
          setIsApproved(false);
          if (!isFirstResponse) {
            setNotApprovedCount((prev) => prev + 1);
          }
        }
        setIsFirstResponse(false);
      }
      setIsWaiting(false);
    },
  });

  useEffect(() => {
    sendMessage({ text: "Give a question to ask the user" });
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded">
        Status:{" "}
        {isWaiting || status === "streaming"
          ? "⏳ Waiting..."
          : isApproved
            ? "✅ Approved"
            : "❌ Not Approved"}
      </div>
      <div className="mb-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded">
        <div>✅ Approved: {approvedCount}</div>
        <div>❌ Not Approved: {notApprovedCount}</div>
      </div>
      {messages.map((message) => {
        if (message.role === "assistant") {
          const firstPart = message.parts.find((part) => part.type === "text");
          if (firstPart && firstPart.type === "text") {
            const text = firstPart.text;
            const lines = text.split("\n");
            const first3Chars = lines[0].substring(0, 3).toUpperCase();
            if (first3Chars.includes("YES") || first3Chars.includes("NO")) {
              const questionText = lines.slice(1).join("\n").trim();
              if (questionText) {
                return (
                  <div key={message.id} className="whitespace-pre-wrap">
                    AI: <div>{questionText}</div>
                  </div>
                );
              }
              return null;
            }
          }
        }

        return (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
              }
            })}
          </div>
        );
      })}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
          setIsApproved(false);
          setIsWaiting(true);
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
