import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Node } from "../api/chatApi";
import { getNodes } from "../api/chatApi";
import "./ChatView.css";

export function ChatView({
  chatId,
  selectedNodeId,
  onSelectNode,
  isDarkMode,
  isLoading,
}: {
  chatId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isDarkMode: boolean;
  isLoading: boolean;
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
            <div className="assistant-bubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.response}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className={`loading-message ${isDarkMode ? "dark-theme" : ""}`}>
          <div className="loading-bubble">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="loading-text">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}