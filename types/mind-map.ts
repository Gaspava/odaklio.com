export interface MindMapNode {
  id: string;
  label: string;
  content?: string;
  imageUrl?: string;
  position: { x: number; y: number };
  color?: string;
  parentId: string | null;
  children: string[];
}

export interface MindMapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  style?: "solid" | "dashed" | "dotted";
}

export interface MindMap {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: Date;
  updatedAt: Date;
}
