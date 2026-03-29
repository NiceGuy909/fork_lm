import { useEffect, useState } from "react";
import type { Node } from "../api/chatApi";
import { getNodes } from "../api/chatApi";

export function ChatView({
  chatId,
  selectedNodeId,
  onSelectNode,
}: {
  chatId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    getNodes(chatId, selectedNodeId).then((res) => {
      setNodes(res.nodes);
    });
  }, [chatId, selectedNodeId]);

  return (
    <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
      {nodes.map((node) => (
        <div
          key={node.id}
          onClick={() => onSelectNode(node.id)}
          style={{
            marginBottom: "20px",
            border: selectedNodeId === node.id ? "2px solid teal" : "1px solid #ccc",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: "bold" }}>User:</div>
          <div>{node.prompt}</div>

          <div style={{ fontWeight: "bold", marginTop: "8px" }}>Assistant:</div>
          <div>{node.response}</div>
        </div>
      ))}
    </div>
  );
}