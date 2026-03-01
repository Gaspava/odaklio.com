"use client";

import { ReactNode } from "react";

// ===== ICON COMPONENTS =====
function DangerIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function WarningIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function InfoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function NoteIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function TipIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function SuccessIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function QuoteIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function ExampleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function FormulaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h6l-6 16h6" />
      <path d="M14 12h8" />
      <path d="M18 8v8" />
    </svg>
  );
}

function DefinitionIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

// ===== BLOCK TYPE CONFIGURATION =====
export type BlockType = "danger" | "warning" | "info" | "note" | "tip" | "success" | "quote" | "example" | "formula" | "definition";

interface BlockConfig {
  icon: ReactNode;
  label: string;
  colorVar: string;
  bgVar: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
}

const blockConfigs: Record<BlockType, BlockConfig> = {
  danger: {
    icon: <DangerIcon size={16} />,
    label: "Dikkat",
    colorVar: "var(--accent-danger)",
    bgVar: "var(--block-danger-bg)",
    borderColor: "var(--block-danger-border)",
    iconColor: "var(--accent-danger)",
    titleColor: "var(--accent-danger)",
  },
  warning: {
    icon: <WarningIcon size={16} />,
    label: "Uyari",
    colorVar: "var(--accent-warning)",
    bgVar: "var(--block-warning-bg)",
    borderColor: "var(--block-warning-border)",
    iconColor: "var(--accent-warning)",
    titleColor: "var(--accent-warning)",
  },
  info: {
    icon: <InfoIcon size={16} />,
    label: "Bilgi",
    colorVar: "var(--accent-secondary)",
    bgVar: "var(--block-info-bg)",
    borderColor: "var(--block-info-border)",
    iconColor: "var(--accent-secondary)",
    titleColor: "var(--accent-secondary)",
  },
  note: {
    icon: <NoteIcon size={16} />,
    label: "Not",
    colorVar: "var(--accent-primary)",
    bgVar: "var(--block-note-bg)",
    borderColor: "var(--block-note-border)",
    iconColor: "var(--accent-primary)",
    titleColor: "var(--accent-primary)",
  },
  tip: {
    icon: <TipIcon size={16} />,
    label: "Ipucu",
    colorVar: "var(--accent-success)",
    bgVar: "var(--block-tip-bg)",
    borderColor: "var(--block-tip-border)",
    iconColor: "var(--accent-success)",
    titleColor: "var(--accent-success)",
  },
  success: {
    icon: <SuccessIcon size={16} />,
    label: "Basarili",
    colorVar: "var(--accent-success)",
    bgVar: "var(--block-success-bg)",
    borderColor: "var(--block-success-border)",
    iconColor: "var(--accent-success)",
    titleColor: "var(--accent-success)",
  },
  quote: {
    icon: <QuoteIcon size={14} />,
    label: "Alinti",
    colorVar: "var(--text-secondary)",
    bgVar: "var(--block-quote-bg)",
    borderColor: "var(--block-quote-border)",
    iconColor: "var(--text-tertiary)",
    titleColor: "var(--text-secondary)",
  },
  example: {
    icon: <ExampleIcon size={16} />,
    label: "Ornek",
    colorVar: "var(--accent-secondary)",
    bgVar: "var(--block-example-bg)",
    borderColor: "var(--block-example-border)",
    iconColor: "var(--accent-secondary)",
    titleColor: "var(--accent-secondary)",
  },
  formula: {
    icon: <FormulaIcon size={16} />,
    label: "Formul",
    colorVar: "var(--accent-primary)",
    bgVar: "var(--block-formula-bg)",
    borderColor: "var(--block-formula-border)",
    iconColor: "var(--accent-primary)",
    titleColor: "var(--accent-primary)",
  },
  definition: {
    icon: <DefinitionIcon size={16} />,
    label: "Tanim",
    colorVar: "var(--accent-primary)",
    bgVar: "var(--block-definition-bg)",
    borderColor: "var(--block-definition-border)",
    iconColor: "var(--accent-primary)",
    titleColor: "var(--accent-primary)",
  },
};

// ===== CONTENT BLOCK COMPONENT =====
interface ContentBlockProps {
  type: BlockType;
  title?: string;
  children: ReactNode;
}

export function ContentBlock({ type, title, children }: ContentBlockProps) {
  const config = blockConfigs[type];

  return (
    <div className="content-block animate-block-in" data-block-type={type}>
      <div
        className="content-block-inner"
        style={{
          background: config.bgVar,
          borderLeft: `3px solid ${config.borderColor}`,
          borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        }}
      >
        <div className="content-block-header">
          <span className="content-block-icon" style={{ color: config.iconColor }}>
            {config.icon}
          </span>
          <span className="content-block-label" style={{ color: config.titleColor }}>
            {title || config.label}
          </span>
        </div>
        <div className="content-block-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ===== CODE BLOCK COMPONENT =====
interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="code-block-wrapper animate-block-in">
      <div className="code-block-header">
        <span className="code-block-lang">{language || "kod"}</span>
        <button onClick={handleCopy} className="code-block-copy" title="Kopyala">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
      <pre className="code-block-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ===== STEP LIST COMPONENT =====
interface StepItemProps {
  number: number;
  children: ReactNode;
}

export function StepItem({ number, children }: StepItemProps) {
  return (
    <div className="step-item animate-block-in" style={{ animationDelay: `${number * 80}ms` }}>
      <div className="step-number">
        <span>{number}</span>
      </div>
      <div className="step-content">{children}</div>
    </div>
  );
}

// ===== KEY POINT HIGHLIGHT =====
interface KeyPointProps {
  children: ReactNode;
}

export function KeyPoint({ children }: KeyPointProps) {
  return (
    <span className="key-point">
      {children}
    </span>
  );
}
