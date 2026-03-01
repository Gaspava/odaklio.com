"use client";

import { MapNode } from "./map-node";

const sampleNodes = [
  { id: "1", label: "Fizik", x: 400, y: 200, isRoot: true },
  { id: "2", label: "Mekanik", x: 200, y: 100 },
  { id: "3", label: "Termodinamik", x: 600, y: 100 },
  { id: "4", label: "Optik", x: 200, y: 300 },
  { id: "5", label: "Elektrik", x: 600, y: 300 },
];

const sampleEdges = [
  { from: "1", to: "2", x1: 400, y1: 200, x2: 200, y2: 100 },
  { from: "1", to: "3", x1: 400, y1: 200, x2: 600, y2: 100 },
  { from: "1", to: "4", x1: 400, y1: 200, x2: 200, y2: 300 },
  { from: "1", to: "5", x1: 400, y1: 200, x2: 600, y2: 300 },
];

export function MapCanvas() {
  return (
    <div className="flex-1 rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 400"
        className="min-h-[400px]"
      >
        {sampleEdges.map((edge) => (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="var(--border)"
            strokeWidth={1.5}
          />
        ))}
        {sampleNodes.map((node) => (
          <MapNode
            key={node.id}
            label={node.label}
            x={node.x}
            y={node.y}
            isRoot={node.isRoot}
          />
        ))}
      </svg>
    </div>
  );
}
