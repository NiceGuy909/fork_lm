// src/components/TreeView.tsx

import { useEffect, useState } from "react";
import type { Node } from "../api/chatApi";
import { getNodes } from "../api/chatApi";

export function TreeView({
  chatId,
  onSelectNode,
}: {
  chatId: string;
  onSelectNode: (id: string | null) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    getNodes(chatId, null).then((res) => {
      if (res.view === "tree") {
        setNodes(res.nodes);
      }
    });
  }, [chatId]);

  return (
    <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            marginBottom: "8px",
            cursor: "pointer",
            background: node.parent_id ? "white" : "#f0f8ff",
          }}
          onClick={() => onSelectNode(node.id)}
        >
          Token: {node.token} | Path: {node.path}
          <div style={{ fontSize: "0.9em", marginTop: "4px" }}>
            {node.prompt.slice(0, 30)}...
          </div>
        </div>
      ))}
    </div>
  );
}