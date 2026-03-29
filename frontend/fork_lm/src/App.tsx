// src/App.tsx

import { useState } from "react";
import { ChatList } from "./components/ChatList.tsx";
import { ChatView } from "./components/ChatView.tsx";
import { TreeView } from "./components/TreeView.tsx";


function App() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [view, setView] = useState<"linear" | "tree">("linear");

  return (
    
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar: List of chats */}
      <ChatList
        selectedChatId={selectedChatId}
        onSelectChat={(id) => setSelectedChatId(id)}
      />

      {/* Main area: switch between ChatView and TreeView */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "8px", display: "flex", gap: "8px" }}>
          {view === "linear" ? (
            <button onClick={() => setView("tree")}>
            Chat View
            </button>
          ) : (
            <button onClick={() => setView("linear")}>
            Tree View
            </button>
          )}
          
          
        </div>

        {selectedChatId &&
          (view === "linear" ? (
            <ChatView chatId={selectedChatId} selectedNodeId={selectedNodeId} />
          ) : (
            <TreeView chatId={selectedChatId} onSelectNode={setSelectedNodeId} />
          ))}
      </div>
    </div>
  );
}

export default App;