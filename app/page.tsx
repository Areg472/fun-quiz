import AIStuff from "./components/aistuff";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fun quiz!",
  description: "A fun quiz to test your knowledge :D",
};

export default function Page() {
  return (
    <>
      <AIStuff />
    </>
  );
}
