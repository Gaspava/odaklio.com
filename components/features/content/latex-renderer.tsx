interface LatexRendererProps {
  expression: string;
  block?: boolean;
}

export function LatexRenderer({ expression, block }: LatexRendererProps) {
  return (
    <span
      className={`font-mono text-accent ${block ? "block text-center py-4 text-lg" : "inline"}`}
    >
      {expression}
    </span>
  );
}
