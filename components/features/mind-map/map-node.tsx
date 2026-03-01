interface MapNodeProps {
  label: string;
  x: number;
  y: number;
  color?: string;
  isRoot?: boolean;
}

export function MapNode({ label, x, y, color, isRoot }: MapNodeProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-60}
        y={-20}
        width={120}
        height={40}
        rx={10}
        fill={color || "var(--surface)"}
        stroke={isRoot ? "var(--accent)" : "var(--border)"}
        strokeWidth={isRoot ? 2 : 1}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground)"
        fontSize={12}
        fontWeight={isRoot ? 600 : 400}
      >
        {label}
      </text>
    </g>
  );
}
