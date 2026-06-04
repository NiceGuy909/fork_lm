import { useEffect, useState } from "react";
import { ChatView } from "./components/ChatView";
import { PromptBar } from "./components/PromptBar";
import { TreeView } from "./components/TreeView";
import { Navbar } from "./components/Navbar";
import { ChatList } from "./components/ChatList";
import { Settings } from "./components/Settings";
import { createChat, deleteChat, getChats, sendMessage, getApiKey, getNodes, type Chat } from "./api/chatApi";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);
  const [currentView, setCurrentView] = useState<"chat" | "tree">("tree");
  const [isDarkMode, setIsDarkMode] = useState(() => {
  const saved = localStorage.getItem("forklm_dark_mode");
  return saved !== null ? saved === "true" : true;
});
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  console.log("App rendered - selectedChatId:", selectedChatId, "currentView:", currentView);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("forklm_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    // Load API key on mount
    const savedApiKey = getApiKey();
    setApiKey(savedApiKey);
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      // Reload API key when settings is opened
      const savedApiKey = getApiKey();
      setApiKey(savedApiKey);
    }
  }, [isSettingsOpen]);

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

  // When a chat is selected, fetch its nodes and select the last one by default
  useEffect(() => {
    if (selectedChatId) {
      getNodes(selectedChatId, null).then((res) => {
        if (res.nodes.length > 0) {
          // Select the last node
          setSelectedNodeId(res.nodes[res.nodes.length - 1].id);
        } else {
          setSelectedNodeId(null);
        }
      });
    }
  }, [selectedChatId]);

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
    if (!apiKey) {
      alert("Please set your Gemini API key in settings first.");
      setIsSettingsOpen(true);
      return;
    }
    try {
      setIsLoading(true);
      const res = await sendMessage(selectedChatId, { prompt, selectedNodeId, apiKey });
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
      backgroundColor: "var(--bg)"
    }}>
      <Navbar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

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

        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0, width: "100%", backgroundColor: "var(--bg)" }}>
          {selectedChatId && currentView === "chat" && (
            <>
              <ChatView
                chatId={selectedChatId}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                isDarkMode={isDarkMode}
                isLoading={isLoading}
              />
              <PromptBar onSend={handleSend} isDarkMode={isDarkMode} isLoading={isLoading} />
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text)" }}>
              Select or create a chat to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}