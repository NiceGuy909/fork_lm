// src/App.tsx

import { useState } from "react";
import { ChatList } from "../src/components/ChatList.tsx";
import { ChatView } from "../src/components/ChatView.tsx";
import { TreeView } from "../src/components/TreeView.tsx";


function App() {
  // const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  // const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // const [view, setView] = useState<"linear" | "tree">("linear");

  return (
    <div className="text-3xl font-bold underline">
      Hello world!
    </div>
    // <div style={{ display: "flex", height: "100vh" }}>
    //   {/* Sidebar: List of chats */}
    //   <ChatList
    //     selectedChatId={selectedChatId}
    //     onSelectChat={(id) => setSelectedChatId(id)}
    //   />

    //   {/* Main area: switch between ChatView and TreeView */}
    //   <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    //     <div style={{ padding: "8px", display: "flex", gap: "8px" }}>
    //       <button onClick={() => setView("linear")}>
    //         Chat View
    //       </button>
    //       <button onClick={() => setView("tree")}>
    //         Tree View
    //       </button>
    //     </div>

    //     {selectedChatId &&
    //       (view === "linear" ? (
    //         <ChatView chatId={selectedChatId} selectedNodeId={selectedNodeId} />
    //       ) : (
    //         <TreeView chatId={selectedChatId} onSelectNode={setSelectedNodeId} />
    //       ))}
    //   </div>
    // </div>
  );
}

export default App;