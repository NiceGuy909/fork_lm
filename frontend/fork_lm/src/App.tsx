import { useEffect, useState } from "react";
import { ChatView } from "./components/ChatView";
import { PromptBar } from "./components/PromptBar";
import { TreeView } from "./components/TreeView";
import { Navbar } from "./components/Navbar";
import { ChatList } from "./components/ChatList";
import { createChat, deleteChat, getChats, sendMessage, type Chat } from "./api/chatApi";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentView, setCurrentView] = useState<"chat" | "tree">("chat");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  console.log("App rendered - selectedChatId:", selectedChatId, "currentView:", currentView);

  async function loadChats() {
    const data = await getChats();
    setChats(data);
    if (!selectedChatId && data.length > 0) {
      setSelectedChatId(data[data.length-1].id);
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
    try {
      setIsLoading(true);
      const res = await sendMessage(selectedChatId, { prompt, selectedNodeId });
      setSelectedNodeId(res.node.id);
      setRefreshKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      width: "100vw", 
      backgroundColor: isDarkMode ? "#1a1a1a" : "#e8e8e8" 
    }}>
      <Navbar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(chatId) => {
            setSelectedChatId(chatId);
            setSelectedNodeId(null);
          }}
          onDeleteChat={handleDeleteChat}
          onCreateChat={handleCreateChat}
          isDarkMode={isDarkMode}
        />

        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0, width: "100%" }}>
          {selectedChatId && currentView === "chat" && (
            <>
              <ChatView
                isLoading={isLoading}
              />
              <PromptBar onSend={handleSend} isDarkMode={isDarkMode} isLoading={isLoading}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                isDarkMode={isDarkMode}
              />
              <PromptBar onSend={handleSend} isDarkMode={isDarkMode} />
            </>
          )}
          {selectedChatId && currentView === "tree" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
              <TreeView
                key={`tree-${selectedChatId}`}
                chatId={selectedChatId}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          {!selectedChatId && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: isDarkMode ? "#666" : "#999" }}>
              Select or create a chat to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}