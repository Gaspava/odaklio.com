"use client";

import React, { useState } from "react";

// ============================================================
// TYPES
// ============================================================

interface ParsedBlock {
  type:
    | "paragraph"
    | "heading"
    | "formula"
    | "warning"
    | "info"
    | "tip"
    | "definition"
    | "summary"
    | "example"
    | "step"
    | "code"
    | "collapsible"
    | "table"
    | "list"
    | "blockquote";
  content: string;
  title?: string;
  language?: string;
  level?: number; // heading level
  items?: string[]; // for steps, lists
  ordered?: boolean; // for lists
  rows?: string[][]; // for tables
  headers?: string[]; // for tables
}

// ============================================================
// PARSER — converts raw AI text into structured blocks
// ============================================================

export function parseContent(raw: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = raw.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- Custom block markers: :::type title ---
    const blockMatch = line.match(
      /^:::(formul|dikkat|not|ipucu|tanim|ozet|ornek|adim|kod|detay)(?:\s+(.*))?$/i
    );
    if (blockMatch) {
      const blockType = blockMatch[1].toLowerCase();
      const title = blockMatch[2]?.trim() || "";
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^:::$/)) {
        contentLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::

      const typeMap: Record<string, ParsedBlock["type"]> = {
        formul: "formula",
        dikkat: "warning",
        not: "info",
        ipucu: "tip",
        tanim: "definition",
        ozet: "summary",
        ornek: "example",
        adim: "step",
        kod: "code",
        detay: "collapsible",
      };

      const mappedType = typeMap[blockType] || "info";

      if (mappedType === "step") {
        const items = contentLines
          .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter(Boolean);
        blocks.push({ type: "step", content: "", title, items });
      } else if (mappedType === "code") {
        blocks.push({
          type: "code",
          content: contentLines.join("\n"),
          language: title || "text",
        });
      } else {
        blocks.push({
          type: mappedType,
          content: contentLines.join("\n"),
          title,
        });
      }
      continue;
    }

    // --- Code blocks with ``` ---
    if (line.match(/^```/)) {
      const lang = line.replace(/^```/, "").trim() || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n"), language: lang });
      continue;
    }

    // --- Tables: lines starting with | ---
    if (line.match(/^\|.*\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].match(/^\|.*\|$/)) {
        tableLines.push(lines[i]);
        i++;
      }
      const parsedRows = tableLines
        .filter((l) => !l.match(/^\|[\s\-:|]+\|$/)) // skip separator rows
        .map((l) =>
          l
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );

      if (parsedRows.length > 0) {
        blocks.push({
          type: "table",
          content: "",
          headers: parsedRows[0],
          rows: parsedRows.slice(1),
        });
      }
      continue;
    }

    // --- Headings ---
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        content: headingMatch[2],
        level: headingMatch[1].length,
      });
      i++;
      continue;
    }

    // --- Blockquotes ---
    if (line.match(/^>\s/)) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
      continue;
    }

    // --- Ordered lists ---
    if (line.match(/^\d+[\.\)]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+[\.\)]\s/)) {
        listItems.push(lines[i].replace(/^\d+[\.\)]\s/, ""));
        i++;
      }
      blocks.push({
        type: "list",
        content: "",
        items: listItems,
        ordered: true,
      });
      continue;
    }

    // --- Unordered lists ---
    if (line.match(/^[\-\*•]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[\-\*•]\s/)) {
        listItems.push(lines[i].replace(/^[\-\*•]\s/, ""));
        i++;
      }
      blocks.push({
        type: "list",
        content: "",
        items: listItems,
        ordered: false,
      });
      continue;
    }

    // --- Empty line: skip ---
    if (!line.trim()) {
      i++;
      continue;
    }

    // --- Paragraph: collect consecutive non-special lines ---
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^:::/) &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^#{1,3}\s/) &&
      !lines[i].match(/^\|.*\|$/) &&
      !lines[i].match(/^>\s/) &&
      !lines[i].match(/^\d+[\.\)]\s/) &&
      !lines[i].match(/^[\-\*•]\s/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join("\n") });
    }
  }

  return blocks;
}

// ============================================================
// INLINE FORMATTER — bold, italic, inline code, links
// ============================================================

function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Pattern: **bold** | *italic* | `code` | [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic" style={{ color: "var(--text-secondary)" }}>
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={match.index} className="chat-inline-code">
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // [text](url)
      parts.push(
        <a
          key={match.index}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-link"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function renderTextWithLineBreaks(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {formatInline(line)}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

// ============================================================
// BLOCK COMPONENTS
// ============================================================

function FormulaBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-formula">
      <div className="chat-box-header">
        <span className="chat-box-icon">📐</span>
        <span className="chat-box-label">{title || "Formül"}</span>
      </div>
      <div className="chat-box-body chat-formula-content">
        {renderTextWithLineBreaks(content)}
      </div>
    </div>
  );
}

function WarningBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-warning">
      <div className="chat-box-header">
        <span className="chat-box-icon">⚠️</span>
        <span className="chat-box-label">{title || "Dikkat"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function InfoBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-info">
      <div className="chat-box-header">
        <span className="chat-box-icon">📝</span>
        <span className="chat-box-label">{title || "Not"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function TipBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-tip">
      <div className="chat-box-header">
        <span className="chat-box-icon">💡</span>
        <span className="chat-box-label">{title || "İpucu"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function DefinitionBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-definition">
      <div className="chat-box-header">
        <span className="chat-box-icon">📖</span>
        <span className="chat-box-label">{title || "Tanım"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function SummaryBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-summary">
      <div className="chat-box-header">
        <span className="chat-box-icon">📌</span>
        <span className="chat-box-label">{title || "Özet"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function ExampleBox({ content, title }: { content: string; title?: string }) {
  return (
    <div className="chat-box chat-box-example">
      <div className="chat-box-header">
        <span className="chat-box-icon">✏️</span>
        <span className="chat-box-label">{title || "Örnek"}</span>
      </div>
      <div className="chat-box-body">{renderTextWithLineBreaks(content)}</div>
    </div>
  );
}

function StepByStepBox({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className="chat-box chat-box-step">
      <div className="chat-box-header">
        <span className="chat-box-icon">📋</span>
        <span className="chat-box-label">{title || "Adım Adım"}</span>
      </div>
      <div className="chat-box-body">
        <ol className="chat-steps">
          {items?.map((item, idx) => (
            <li key={idx} className="chat-step-item">
              <span className="chat-step-number">{idx + 1}</span>
              <span className="chat-step-text">{formatInline(item)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function CodeBlock({ content, language }: { content: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chat-code-block">
      <div className="chat-code-header">
        <span className="chat-code-lang">{language || "text"}</span>
        <button className="chat-code-copy" onClick={handleCopy}>
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>
      <pre className="chat-code-pre">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function CollapsibleSection({ content, title }: { content: string; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`chat-collapsible ${open ? "chat-collapsible-open" : ""}`}>
      <button className="chat-collapsible-trigger" onClick={() => setOpen(!open)}>
        <span className="chat-collapsible-arrow">{open ? "▼" : "▶"}</span>
        <span className="chat-collapsible-title">{title || "Detaylı Açıklama"}</span>
      </button>
      {open && (
        <div className="chat-collapsible-body">
          {renderTextWithLineBreaks(content)}
        </div>
      )}
    </div>
  );
}

function TableBlock({ headers, rows }: { headers?: string[]; rows?: string[][] }) {
  if (!headers || !rows) return null;
  return (
    <div className="chat-table-wrapper">
      <table className="chat-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{formatInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{formatInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListBlock({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`chat-list ${ordered ? "chat-list-ordered" : "chat-list-unordered"}`}>
      {items?.map((item, i) => (
        <li key={i} className="chat-list-item">
          {formatInline(item)}
        </li>
      ))}
    </Tag>
  );
}

function BlockquoteBlock({ content }: { content: string }) {
  return (
    <blockquote className="chat-blockquote">
      {renderTextWithLineBreaks(content)}
    </blockquote>
  );
}

function HeadingBlock({ content, level }: { content: string; level?: number }) {
  const className = `chat-heading chat-heading-${level || 2}`;
  return <div className={className}>{formatInline(content)}</div>;
}

function ParagraphBlock({ content }: { content: string }) {
  return <p className="chat-paragraph">{renderTextWithLineBreaks(content)}</p>;
}

// ============================================================
// MAIN RENDERER
// ============================================================

interface ChatRendererProps {
  content: string;
  isStreaming?: boolean;
}

export default function ChatRenderer({ content, isStreaming }: ChatRendererProps) {
  const blocks = parseContent(content);

  return (
    <div className="chat-renderer">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "formula":
            return <FormulaBox key={i} content={block.content} title={block.title} />;
          case "warning":
            return <WarningBox key={i} content={block.content} title={block.title} />;
          case "info":
            return <InfoBox key={i} content={block.content} title={block.title} />;
          case "tip":
            return <TipBox key={i} content={block.content} title={block.title} />;
          case "definition":
            return <DefinitionBox key={i} content={block.content} title={block.title} />;
          case "summary":
            return <SummaryBox key={i} content={block.content} title={block.title} />;
          case "example":
            return <ExampleBox key={i} content={block.content} title={block.title} />;
          case "step":
            return <StepByStepBox key={i} items={block.items || []} title={block.title} />;
          case "code":
            return <CodeBlock key={i} content={block.content} language={block.language} />;
          case "collapsible":
            return <CollapsibleSection key={i} content={block.content} title={block.title} />;
          case "table":
            return <TableBlock key={i} headers={block.headers} rows={block.rows} />;
          case "list":
            return <ListBlock key={i} items={block.items || []} ordered={block.ordered} />;
          case "blockquote":
            return <BlockquoteBlock key={i} content={block.content} />;
          case "heading":
            return <HeadingBlock key={i} content={block.content} level={block.level} />;
          case "paragraph":
          default:
            return <ParagraphBlock key={i} content={block.content} />;
        }
      })}
      {isStreaming && (
        <span className="chat-streaming-cursor">
          <span className="chat-cursor-dot" />
        </span>
      )}
    </div>
  );
}
