import { useEffect, useState } from "react";
import { ChatView } from "./components/ChatView";
import { PromptBar } from "./components/PromptBar";
import { TreeView } from "./components/TreeView";
import { Navbar } from "./components/Navbar";
import { createChat, deleteChat, getChats, sendMessage, type Chat } from "./api/chatApi";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentView, setCurrentView] = useState<"chat" | "tree">("chat");

  console.log("App rendered - selectedChatId:", selectedChatId, "currentView:", currentView);

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        <div style={{ width: "280px", borderRight: "1px solid #ddd", padding: "8px 4px", overflowY: "auto", minWidth: "280px", flexShrink: 0 }}>
          <button onClick={handleCreateChat} style={{ marginBottom: 16, width: "100%", padding: "8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
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
                  backgroundColor: selectedChatId === chat.id ? "#e3f2fd" : "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {chat.title ?? chat.id}
              </button>

              <button onClick={() => handleDeleteChat(chat.id)} style={{ padding: "4px 8px", backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                X
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0, width: "100%" }}>
          {selectedChatId && currentView === "chat" && (
            <>
              <ChatView
                key={`${selectedChatId}-${selectedNodeId}-${refreshKey}`}
                chatId={selectedChatId}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
              <PromptBar onSend={handleSend} />
            </>
          )}
          {selectedChatId && currentView === "tree" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
              <TreeView
                key={`tree-${selectedChatId}`}
                chatId={selectedChatId}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
          )}
          {!selectedChatId && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#999" }}>
              Select or create a chat to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}