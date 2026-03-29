// src/components/ChatList.tsx

import { useEffect, useState } from "react";
import type { Chat } from "../api/chatApi";
import { getChats } from "../api/chatApi";

export function ChatList({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId: string | null;
  onSelectChat: (id: string | null) => void;
}) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    getChats().then(setChats);
  }, []);

  return (
    <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "8px" }}>
      <h3>Chats</h3>
      {chats.map((chat) => (
        <div
          key={chat.id}
          style={{
            padding: "8px",
            cursor: "pointer",
            background: selectedChatId === chat.id ? "#e0f7fa" : "white",
          }}
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.title || "Untitled Chat"}
        </div>
      ))}
    </div>
  );
}