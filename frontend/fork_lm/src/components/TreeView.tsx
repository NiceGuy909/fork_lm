// 
import { useCallback, useEffect } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node as FlowNode,
  type Edge,
  type Connection,
  type NodeMouseHandler,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import './TreeView.css';
import { getNodes, type Node } from '../api/chatApi';

type TreeNodeData = { label: string };

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const NODE_WIDTH = 180;
const NODE_HEIGHT = 48;

function layoutElements(
  nodes: FlowNode<TreeNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: pos.x - NODE_WIDTH / 2,
          y: pos.y - NODE_HEIGHT / 2,
        },
      };
    }),
    edges,
  };
}

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
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode<TreeNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    async function loadTreeData() {
      try {
        const response = await getNodes(chatId, null);
        const nodeList = response.nodes as Node[];

        const flowNodes: FlowNode<TreeNodeData>[] = nodeList.map((node) => ({
          id: node.id,
          data: {
            label:
              node.prompt.substring(0, 50) + (node.prompt.length > 50 ? '...' : ''),
          },
          position: { x: 0, y: 0 },
          selected: node.id === selectedNodeId,
        }));

        const flowEdges: Edge[] = nodeList
          .filter((node) => node.parent_id !== null)
          .map((node) => ({
            id: `${node.parent_id}-${node.id}`,
            source: node.parent_id!,
            target: node.id,
            type: 'smoothstep',
          }));

        const layouted = layoutElements(flowNodes, flowEdges, 'TB');
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      } catch (error) {
        console.error('Failed to load tree data:', error);
      }
    }

    if (chatId) loadTreeData();
  }, [chatId, setNodes, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
      }))
    );
  }, [selectedNodeId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      onSelectNode(node.id);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    },
    [onSelectNode, setNodes]
  );

  return (
    <div className={`tree-view-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}