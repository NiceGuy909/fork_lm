import { useEffect, useState } from "react";
import { ChatView } from "./components/ChatView";
import { PromptBar } from "./components/PromptBar";
import { createChat, deleteChat, getChats, sendMessage, type Chat } from "./api/chatApi";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function loadChats() {
    const data = await getChats();
    setChats(data);
    if (!selectedChatId && data.length > 0) {
      setSelectedChatId(data[0].id);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  async function handleCreateChat() {
    const chat = await createChat("New Chat");
    await loadChats();
    setSelectedChatId(chat.id);
    setSelectedNodeId(null);
  }

  async function handleDeleteChat(chatId: string) {
    await deleteChat(chatId);
    const updated = await getChats();
    setChats(updated);

    if (selectedChatId === chatId) {
      setSelectedChatId(updated.length ? updated[0].id : null);
      setSelectedNodeId(null);
    }
  }

  async function handleSend(prompt: string) {
    if (!selectedChatId) return;
    const res = await sendMessage(selectedChatId, { prompt, selectedNodeId });
    setSelectedNodeId(res.node.id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 280, borderRight: "1px solid #ddd", padding: 16 }}>
        <button onClick={handleCreateChat} style={{ marginBottom: 16 }}>
          New Chat
        </button>

        {chats.map((chat) => (
          <div
            key={chat.id}
            style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}
          >
            <button
              onClick={() => {
                setSelectedChatId(chat.id);
                setSelectedNodeId(null);
              }}
              style={{
                flex: 1,
                textAlign: "left",
                padding: 8,
              }}
            >
              {chat.title ?? chat.id}
            </button>

            <button onClick={() => handleDeleteChat(chat.id)}>
              X
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {selectedChatId && (
          <ChatView
            key={`${selectedChatId}-${selectedNodeId}-${refreshKey}`}
            chatId={selectedChatId}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        )}
        <PromptBar onSend={handleSend} />
      </div>
    </div>
  );
}