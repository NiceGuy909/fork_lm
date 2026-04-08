import { useEffect, useState } from "react";
import type { Node } from "../api/chatApi";
import { getNodes } from "../api/chatApi";
import "./ChatView.css";

export function ChatView({
  chatId,
  selectedNodeId,
  onSelectNode,
  isDarkMode,
}: {
  chatId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isDarkMode: boolean;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    getNodes(chatId, selectedNodeId).then((res) => {
      setNodes(res.nodes);
    });
  }, [chatId, selectedNodeId]);

  return (
    <div className={`chat-view-container ${isDarkMode ? "dark-theme" : ""}`}>
      {nodes.map((node) => (
        <div
          key={node.id}
          onClick={() => onSelectNode(node.id)}
          className={`chat-message-item ${selectedNodeId === node.id ? "selected" : ""}`}
        >
          <div className="user-message">
            <div className="user-bubble">{node.prompt}</div>
          </div>

          <div className="assistant-message">
            <div className="assistant-bubble">{node.response}</div>
          </div>
        </div>
      ))}
    </div>
  );
}