// src/components/ChatView.tsx

import { useEffect, useState } from "react";
import type { Node } from "../api/chatApi";
import { getNodes } from "../api/chatApi";

export function ChatView({
  chatId,
  selectedNodeId,
}: {
  chatId: string;
  selectedNodeId: string | null;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    getNodes(chatId, selectedNodeId).then((res) => {
      if (res.view === "linear") {
        setNodes(res.nodes);
      }
    });
  }, [chatId, selectedNodeId]);

  return (
    <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
      {nodes.map((node) => (
        <div key={node.id} style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: "bold" }}>User:</div>
          <div>{node.prompt}</div>

          <div style={{ fontWeight: "bold", marginTop: "8px" }}>Assistant:</div>
          <div>{node.response}</div>
        </div>
      ))}
    </div>
  );
}