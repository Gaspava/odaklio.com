"use client";

import { useState, useRef, useEffect } from "react";
import { IconHelp } from "../icons/Icons";

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: "lg" | "md" | "sm";
  children: string[];
  description?: string;
  imageEmoji?: string;
}

const sampleNodes: MindMapNode[] = [
  {
    id: "center",
    label: "Kuantum Fiziği",
    x: 400,
    y: 300,
    color: "#8B5CF6",
    size: "lg",
    children: ["wave", "particle", "uncertainty", "entanglement"],
    imageEmoji: "⚛️",
  },
  {
    id: "wave",
    label: "Dalga Mekaniği",
    x: 180,
    y: 160,
    color: "#3B82F6",
    size: "md",
    children: ["schrodinger"],
    description: "Maddenin dalga özelliklerini inceler",
    imageEmoji: "🌊",
  },
  {
    id: "particle",
    label: "Parçacık Fiziği",
    x: 620,
    y: 160,
    color: "#10B981",
    size: "md",
    children: ["quark"],
    description: "Atomaltı parçacıkların yapısı",
    imageEmoji: "🔬",
  },
  {
    id: "uncertainty",
    label: "Belirsizlik İlkesi",
    x: 180,
    y: 440,
    color: "#F59E0B",
    size: "md",
    children: [],
    description: "Heisenberg - konum ve momentum aynı anda bilinemez",
    imageEmoji: "❓",
  },
  {
    id: "entanglement",
    label: "Kuantum Dolanıklık",
    x: 620,
    y: 440,
    color: "#EF4444",
    size: "md",
    children: ["teleport"],
    description: "İki parçacığın uzaktan bağlantısı",
    imageEmoji: "🔗",
  },
  {
    id: "schrodinger",
    label: "Schrödinger Denklemi",
    x: 60,
    y: 80,
    color: "#6366F1",
    size: "sm",
    children: [],
    description: "iℏ ∂ψ/∂t = Ĥψ",
    imageEmoji: "🐱",
  },
  {
    id: "quark",
    label: "Kuarklar",
    x: 740,
    y: 80,
    color: "#14B8A6",
    size: "sm",
    children: [],
    description: "Up, Down, Strange, Charm, Bottom, Top",
    imageEmoji: "🧬",
  },
  {
    id: "teleport",
    label: "Kuantum Teleportasyon",
    x: 740,
    y: 520,
    color: "#EC4899",
    size: "sm",
    children: [],
    description: "Kuantum bilgi transferi",
    imageEmoji: "✨",
  },
];

export default function MindMap() {
  const [nodes, setNodes] = useState<MindMapNode[]>(sampleNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeSize = (size: MindMapNode["size"]) => {
    switch (size) {
      case "lg": return { w: 160, h: 70, fontSize: 14 };
      case "md": return { w: 140, h: 56, fontSize: 12 };
      case "sm": return { w: 130, h: 48, fontSize: 11 };
    }
  };

  const handleMouseDown = (nodeId: string) => {
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNode ? { ...n, x, y } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.3, Math.min(2, prev + delta)));
  };

  const selected = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="relative" style={{ height: "calc(100vh - 200px)" }}>
      {/* Toolbar */}
      <div
        className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl px-3 py-2 glass"
      >
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          +
        </button>
        <span
          className="text-xs font-medium min-w-[40px] text-center"
          style={{ color: "var(--text-tertiary)" }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          -
        </button>
      </div>

      {/* Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-primary)",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Connections */}
          {nodes.map((node) =>
            node.children.map((childId) => {
              const child = nodes.find((n) => n.id === childId);
              if (!child) return null;
              return (
                <g key={`${node.id}-${childId}`}>
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={child.x}
                    y2={child.y}
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    strokeDasharray="6 4"
                  />
                  {/* Animated dot on line */}
                  <circle r="3" fill={node.color} opacity="0.6">
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M${node.x},${node.y} L${child.x},${child.y}`}
                    />
                  </circle>
                </g>
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const size = getNodeSize(node.size);
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                onMouseDown={() => handleMouseDown(node.id)}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                className="cursor-pointer"
              >
                {/* Glow effect */}
                {isSelected && (
                  <rect
                    x={node.x - size.w / 2 - 4}
                    y={node.y - size.h / 2 - 4}
                    width={size.w + 8}
                    height={size.h + 8}
                    rx={16}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Node Background */}
                <rect
                  x={node.x - size.w / 2}
                  y={node.y - size.h / 2}
                  width={size.w}
                  height={size.h}
                  rx={12}
                  fill="var(--bg-card)"
                  stroke={node.color}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeOpacity={isSelected ? 1 : 0.5}
                />

                {/* Color accent bar */}
                <rect
                  x={node.x - size.w / 2}
                  y={node.y - size.h / 2}
                  width={size.w}
                  height={3}
                  rx={1}
                  fill={node.color}
                />

                {/* Emoji */}
                {node.imageEmoji && (
                  <text
                    x={node.x - size.w / 2 + 14}
                    y={node.y + 5}
                    fontSize="18"
                    textAnchor="middle"
                  >
                    {node.imageEmoji}
                  </text>
                )}

                {/* Label */}
                <text
                  x={node.x + (node.imageEmoji ? 8 : 0)}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize={size.fontSize}
                  fontWeight="600"
                  fill="var(--text-primary)"
                  fontFamily="var(--font-sans)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Node Detail Panel */}
      {selected && (
        <div
          className="absolute top-4 right-4 z-10 w-72 rounded-xl p-4 animate-slide-right"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{selected.imageEmoji}</span>
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {selected.label}
            </h3>
          </div>

          {selected.description && (
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {selected.description}
            </p>
          )}

          <div className="flex gap-2">
            <button
              className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              Detay Gör
            </button>
            <button
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                background: "var(--accent-warning-light)",
                color: "var(--accent-warning)",
              }}
            >
              <IconHelp size={12} />
              Soru Sor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
