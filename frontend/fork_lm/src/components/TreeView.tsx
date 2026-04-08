import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '../../node_modules/@xyflow/react/dist/style.css';
import './TreeView.css';
import { getNodes, type Node } from '../api/chatApi';

export function TreeView({
  chatId,
  selectedNodeId,
  onSelectNode,
  isDarkMode,
}: {
  chatId: string;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  isDarkMode: boolean;
}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Fetch nodes and generate edges on chatId change
  useEffect(() => {
    async function loadTreeData() {
      try {
        const response = await getNodes(chatId, null);
        const nodeList = response.nodes as Node[];

        // Create ReactFlow nodes with initial positions
        const flowNodes = nodeList.map((node, index) => ({
          id: node.id,
          data: { label: node.prompt.substring(0, 50) + (node.prompt.length > 50 ? '...' : '') },
          position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 150 },
        }));

        // Generate edges from parent_id relationships
        const flowEdges = nodeList
          .filter(node => node.parent_id !== null)
          .map(node => ({
            id: `${node.parent_id}-${node.id}`,
            source: node.parent_id,
            target: node.id,
          }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Failed to load tree data:', error);
      }
    }

    if (chatId) {
      loadTreeData();
    }
  }, [chatId]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className={`tree-view-container ${isDarkMode ? "dark-theme" : ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}