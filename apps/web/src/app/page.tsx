"use client";

import Chat from "@/components/chat";

export default function Home() {
  return (
    <main>
      <div className="flex h-[calc(100vh-53px)] w-full p-4">
        <Chat />
      </div>
    </main>
  );
}
