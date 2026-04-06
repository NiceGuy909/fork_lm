import type { Node } from "../api/chatApi";
import type { Node as FlowNode, Edge } from "reactflow";
import dagre from "dagre";

export function layoutNodes(
  nodes: Node[]
): { nodes: FlowNode[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 50 });

  // Convert nodes to flow nodes
  const flowNodes: FlowNode[] = nodes.map((node) => ({
    id: node.id,
    data: {
      label: `${node.token || node.id.slice(0, 8)}`,
    },
    position: { x: 0, y: 0 },
  }));

  // Add nodes to dagre
  flowNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: 140,
      height: 80,
    });
  });

  // Create edges based on parent-child relationships
  const edges: Edge[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  nodes.forEach((node) => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      dagreGraph.setEdge(node.parent_id, node.id);
      edges.push({
        id: `${node.parent_id}-${node.id}`,
        source: node.parent_id,
        target: node.id,
        animated: true,
      });
    }
  });

  // Apply dagre layout
  dagre.layout(dagreGraph);

  // Update positions
  const layoutedNodes = flowNodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - 70,
        y: dagreNode.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
