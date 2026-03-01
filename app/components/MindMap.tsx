"use client";
import { useState, useRef, useCallback } from "react";

interface MindNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  icon?: string;
  description?: string;
  imageUrl?: string;
}

interface MindEdge {
  from: string;
  to: string;
}

const COLORS = ["#7c6cf0", "#00b894", "#e17055", "#0984e3", "#fdcb6e", "#a29bfe", "#55efc4", "#ff7675"];

const INITIAL_NODES: MindNode[] = [
  { id: "1", label: "Fizik", x: 400, y: 250, color: "#7c6cf0", icon: "⚛️", description: "Madde ve enerji bilimi" },
  { id: "2", label: "Mekanik", x: 220, y: 120, color: "#0984e3", icon: "⚙️", description: "Hareket ve kuvvetler" },
  { id: "3", label: "Optik", x: 580, y: 120, color: "#fdcb6e", icon: "💡", description: "Isik ve goruntuler" },
  { id: "4", label: "Termodinamik", x: 180, y: 350, color: "#e17055", icon: "🌡️", description: "Isi ve enerji donusumleri" },
  { id: "5", label: "Elektromanyetizma", x: 600, y: 380, color: "#00b894", icon: "⚡", description: "Elektrik ve manyetik alanlar" },
  { id: "6", label: "Kuantum", x: 400, y: 450, color: "#a29bfe", icon: "🔬", description: "Atom alti parcaciklar" },
  { id: "7", label: "Newton Kanunlari", x: 80, y: 180, color: "#74b9ff", description: "F = ma" },
  { id: "8", label: "Dalga Teorisi", x: 700, y: 200, color: "#ffeaa7", description: "Isik dalga ozelligi" },
];

const INITIAL_EDGES: MindEdge[] = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "1", to: "4" },
  { from: "1", to: "5" },
  { from: "1", to: "6" },
  { from: "2", to: "7" },
  { from: "3", to: "8" },
];

export default function MindMap() {
  const [nodes, setNodes] = useState<MindNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<MindEdge[]>(INITIAL_EDGES);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting !== id) {
        setEdges((prev) => [...prev, { from: connecting, to: id }]);
      }
      setConnecting(null);
      return;
    }
    const node = nodes.find((n) => n.id === id);
    if (!node || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX / zoom - svgRect.left / zoom - node.x,
      y: e.clientY / zoom - svgRect.top / zoom - node.y,
    };
    setDragging(id);
    setSelected(id);
  }, [connecting, nodes, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX / zoom - svgRect.left / zoom - dragOffset.current.x;
    const y = e.clientY / zoom - svgRect.top / zoom - dragOffset.current.y;
    setNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
  }, [dragging, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const addNode = () => {
    if (!newLabel.trim()) return;
    const newNode: MindNode = {
      id: Date.now().toString(),
      label: newLabel,
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      color: COLORS[nodes.length % COLORS.length],
    };
    setNodes((prev) => [...prev, newNode]);
    if (selected) {
      setEdges((prev) => [...prev, { from: selected, to: newNode.id }]);
    }
    setNewLabel("");
    setShowAdd(false);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelected(null);
  };

  const selectedNode = selected ? getNode(selected) : null;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Zihin Haritasi
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setConnecting(selected)}
            className="rounded-lg px-2 py-1 text-[10px]"
            style={{
              backgroundColor: connecting ? "var(--accent)" : "var(--bg-tertiary)",
              color: connecting ? "#fff" : "var(--text-secondary)",
            }}
          >
            {connecting ? "Bagla..." : "Bagla"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg px-2 py-1 text-[10px]"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            + Dugum
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
            className="rounded-lg px-2 py-1 text-[10px]"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
            className="rounded-lg px-2 py-1 text-[10px]"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            -
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="flex gap-2 border-b p-3" style={{ borderColor: "var(--border-color)" }}>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNode()}
            placeholder="Dugum adi..."
            className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-tertiary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            autoFocus
          />
          <button onClick={addNode} className="rounded-lg px-3 py-1.5 text-xs text-white" style={{ backgroundColor: "var(--accent)" }}>
            Ekle
          </button>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? "grabbing" : connecting ? "crosshair" : "default" }}
        >
          <g transform={`scale(${zoom})`}>
            {/* Grid dots */}
            <defs>
              <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.8" fill="var(--border-color)" />
              </pattern>
            </defs>
            <rect width="2000" height="2000" fill="url(#dots)" />

            {/* Edges */}
            {edges.map((e, i) => {
              const from = getNode(e.from);
              const to = getNode(e.to);
              if (!from || !to) return null;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2 - 30;
              return (
                <g key={i}>
                  <path
                    d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <path
                    d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={from.color}
                    strokeWidth="2"
                    opacity="0.15"
                    strokeDasharray="4 4"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => setSelected(node.id)}
                style={{ cursor: "grab" }}
              >
                {/* Glow */}
                {selected === node.id && (
                  <circle cx={node.x} cy={node.y} r="42" fill={node.color} opacity="0.1" />
                )}
                {/* Background */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="35"
                  fill="var(--bg-card)"
                  stroke={selected === node.id ? node.color : "var(--border-color)"}
                  strokeWidth={selected === node.id ? 2.5 : 1.5}
                />
                {/* Icon */}
                {node.icon && (
                  <text x={node.x} y={node.y - 5} textAnchor="middle" fontSize="16" dominantBaseline="central">
                    {node.icon}
                  </text>
                )}
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + (node.icon ? 16 : 4)}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="10"
                  fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="border-t p-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {selectedNode.icon} {selectedNode.label}
              </span>
            </div>
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="rounded-lg px-2 py-1 text-[10px]"
              style={{ backgroundColor: "#e1705522", color: "#e17055" }}
            >
              Sil
            </button>
          </div>
          {selectedNode.description && (
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              {selectedNode.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
