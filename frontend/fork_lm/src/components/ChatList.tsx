// src/components/ChatList.tsx

import type { Chat } from "../api/chatApi";
import "./ChatList.css";

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  onCreateChat,
  isDarkMode,
}: {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onCreateChat: () => void;
  isDarkMode: boolean;
}) {
  return (
    <div className={`chat-list-container ${isDarkMode ? "dark-theme" : ""}`}>
      <div className="chat-list-title">Conversations</div>
      <button className="new-chat-button" onClick={onCreateChat}>
        + New Chat
      </button>
      <div className="chat-list-items">
        {chats.map((chat) => (
          <div key={chat.id} className="chat-item">
            <button
              className={`chat-item-button ${selectedChatId === chat.id ? "active" : ""}`}
              onClick={() => onSelectChat(chat.id)}
              title={chat.title ?? chat.id}
            >
              {chat.title ?? chat.id}
            </button>
            <button
              className="chat-delete-button"
              onClick={() => onDeleteChat(chat.id)}
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}