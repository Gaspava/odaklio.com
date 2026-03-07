"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";

// Register commonly used languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import dockerfile from "highlight.js/lib/languages/dockerfile";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("jsx", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cs", csharp);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("rb", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("docker", dockerfile);

/* ===== CALLOUT ICONS ===== */
function DangerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const CALLOUT_CONFIG = {
  danger: { icon: DangerIcon, label: "Dikkat", className: "callout-danger" },
  warning: { icon: WarningIcon, label: "Uyarı", className: "callout-warning" },
  info: { icon: InfoIcon, label: "Bilgi", className: "callout-info" },
  tip: { icon: TipIcon, label: "İpucu", className: "callout-tip" },
  note: { icon: NoteIcon, label: "Not", className: "callout-note" },
  success: { icon: SuccessIcon, label: "Başarılı", className: "callout-success" },
} as const;

type CalloutType = keyof typeof CALLOUT_CONFIG;

/* ===== CALLOUT COMPONENT ===== */
function Callout({ type, title, children }: { type: CalloutType; title?: string; children: React.ReactNode }) {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={`callout ${config.className}`} role="note">
      <div className="callout-header">
        <span className="callout-icon">
          <Icon />
        </span>
        <span className="callout-title text-sm font-bold">
          {title || config.label}
        </span>
      </div>
      <div className="callout-body text-[15px] sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

/* ===== CODE BLOCK COMPONENT ===== */
function CodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  useEffect(() => {
    if (codeRef.current) {
      // Reset before re-highlighting
      codeRef.current.removeAttribute("data-highlighted");
      try {
        if (language && hljs.getLanguage(language)) {
          codeRef.current.innerHTML = hljs.highlight(code, { language }).value;
        } else {
          const result = hljs.highlightAuto(code);
          codeRef.current.innerHTML = result.value;
        }
      } catch {
        // Fallback to plain text
        codeRef.current.textContent = code;
      }
    }
  }, [code, language]);

  return (
    <div className="code-block group" aria-label={`Kod bloğu: ${language || "code"}`}>
      <div className="code-block-header">
        <span className="code-lang">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="copy-btn flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all"
          style={{
            background: copied ? "var(--accent-success-light)" : "var(--bg-tertiary)",
            color: copied ? "var(--accent-success)" : "var(--text-tertiary)",
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <div className="code-block-content">
        <pre className="whitespace-pre-wrap break-words"><code ref={codeRef}>{code}</code></pre>
      </div>
    </div>
  );
}

/* ===== INLINE FORMATTING ===== */
function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      parts.push(<del key={key++}>{renderInlineFormatting(strikeMatch[1])}</del>);
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Highlight: ==text==
    const highlightMatch = remaining.match(/^==(.+?)==/);
    if (highlightMatch) {
      parts.push(<mark key={key++}>{renderInlineFormatting(highlightMatch[1])}</mark>);
      remaining = remaining.slice(highlightMatch[0].length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} style={{ color: "var(--text-primary)", fontWeight: 650 }}>{renderInlineFormatting(boldMatch[1])}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++} style={{ color: "var(--accent-primary)" }}>{renderInlineFormatting(italicMatch[1])}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+?)`/);
    if (codeMatch) {
      parts.push(<code key={key++} className="inline-code">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular character
    const nextSpecial = remaining.slice(1).search(/[~=\*`\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else {
      parts.push(remaining.slice(0, nextSpecial + 1));
      remaining = remaining.slice(nextSpecial + 1);
    }
  }

  return parts;
}

/* ===== MAIN CONTENT PARSER ===== */
interface ParsedBlock {
  type: "paragraph" | "heading" | "code" | "callout" | "list" | "blockquote" | "hr" | "table";
  content: string;
  meta?: string;
  items?: ListItem[];
  ordered?: boolean;
  level?: number;
  calloutType?: CalloutType;
  rows?: string[][];
  calloutBlocks?: ParsedBlock[];
}

interface ListItem {
  text: string;
  children?: ListItem[];
  childOrdered?: boolean;
}

function parseListItems(lines: string[], startI: number, allLines: string[], ordered: boolean): { items: ListItem[]; nextI: number } {
  const items: ListItem[] = [];
  let i = startI;
  const bulletPattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;

  while (i < allLines.length) {
    const line = allLines[i];
    const trimmed = line.trimStart();

    // Check if this is a top-level list item
    const indent = line.length - line.trimStart().length;
    if (indent === 0 && trimmed.match(bulletPattern)) {
      const text = trimmed.replace(bulletPattern, "");
      const item: ListItem = { text };

      i++;

      // Check for nested items (indented by 2+ spaces)
      const nestedLines: string[] = [];
      while (i < allLines.length) {
        const nextLine = allLines[i];
        const nextIndent = nextLine.length - nextLine.trimStart().length;
        if (nextIndent >= 2 && nextLine.trimStart().match(/^[-*]\s+|^\d+\.\s+/)) {
          nestedLines.push(nextLine.trimStart());
          i++;
        } else if (nextIndent >= 2 && nestedLines.length > 0) {
          // Continuation line of nested content
          nestedLines.push(nextLine.trimStart());
          i++;
        } else {
          break;
        }
      }

      if (nestedLines.length > 0) {
        const isChildOrdered = !!nestedLines[0].match(/^\d+\.\s+/);
        const childBullet = isChildOrdered ? /^\d+\.\s+/ : /^[-*]\s+/;
        item.children = nestedLines
          .filter(l => l.match(childBullet))
          .map(l => ({ text: l.replace(childBullet, "") }));
        item.childOrdered = isChildOrdered;
      }

      items.push(item);
    } else {
      break;
    }
  }

  return { items, nextI: i };
}

function parseContent(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: ```lang ... ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n"), meta: lang || undefined });
      continue;
    }

    // Callout: > [!type] or :::type or [!TYPE] Title
    const calloutMatch = line.trim().match(/^(?:>{1,}\s*)?(?:\[!(\w+)\]|:::(\w+))(?:\s+(.*))?$/i);
    if (calloutMatch) {
      const calloutType = (calloutMatch[1] || calloutMatch[2] || "").toLowerCase() as CalloutType;
      if (calloutType in CALLOUT_CONFIG) {
        const title = calloutMatch[3] || undefined;
        const contentLines: string[] = [];
        i++;
        while (i < lines.length) {
          const cLine = lines[i].trim();
          // End if: empty line followed by non-callout content, or ::: closing, or another callout/heading
          if (cLine === ":::" || cLine.match(/^(?:>{1,}\s*)?(?:\[!(\w+)\]|:::(\w+))/i) || cLine.match(/^#{1,3}\s/)) break;
          if (cLine === "" && i + 1 < lines.length && !lines[i + 1].trim().startsWith(">")) break;
          // Strip leading > from content lines
          contentLines.push(cLine.replace(/^>\s*/, ""));
          i++;
        }
        if (lines[i]?.trim() === ":::") i++; // skip closing :::
        // Parse callout content as blocks for rich formatting
        const calloutBlocks = parseContent(contentLines.join("\n"));
        blocks.push({ type: "callout", content: contentLines.join("\n"), calloutType, meta: title, calloutBlocks });
        continue;
      }
    }

    // Heading: # ## ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: "heading", content: headingMatch[2], level: headingMatch[1].length });
      i++;
      continue;
    }

    // Horizontal rule: --- or ***
    if (line.trim().match(/^(-{3,}|\*{3,})$/)) {
      blocks.push({ type: "hr", content: "" });
      i++;
      continue;
    }

    // Unordered list: - item or * item
    if (line.trim().match(/^[-*]\s+/) && line.length - line.trimStart().length === 0) {
      const { items, nextI } = parseListItems(lines, i, lines, false);
      i = nextI;
      blocks.push({ type: "list", content: "", items, ordered: false });
      continue;
    }

    // Ordered list: 1. item
    if (line.trim().match(/^\d+\.\s+/) && line.length - line.trimStart().length === 0) {
      const { items, nextI } = parseListItems(lines, i, lines, true);
      i = nextI;
      blocks.push({ type: "list", content: "", items, ordered: true });
      continue;
    }

    // Blockquote: > text (that isn't a callout)
    if (line.trim().startsWith("> ") && !line.trim().match(/^>\s*\[!/)) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
      continue;
    }

    // Table: | header | header |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const cells = lines[i].trim().slice(1, -1).split("|").map(c => c.trim());
        // Skip separator rows (|---|---|)
        if (!cells.every(c => c.match(/^[-:]+$/))) {
          rows.push(cells);
        }
        i++;
      }
      if (rows.length > 0) {
        blocks.push({ type: "table", content: "", rows });
      }
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (
        nextLine.trim() === "" ||
        nextLine.trim().startsWith("```") ||
        nextLine.trim().match(/^#{1,3}\s/) ||
        nextLine.trim().match(/^[-*]\s+/) ||
        nextLine.trim().match(/^\d+\.\s+/) ||
        nextLine.trim().startsWith("> ") ||
        nextLine.trim().match(/^(?:\[!|:::)/) ||
        nextLine.trim().match(/^(-{3,}|\*{3,})$/) ||
        (nextLine.trim().startsWith("|") && nextLine.trim().endsWith("|"))
      ) {
        break;
      }
      paraLines.push(nextLine);
      i++;
    }
    blocks.push({ type: "paragraph", content: paraLines.join("\n") });
  }

  return blocks;
}

/* ===== RENDER LIST ITEMS ===== */
function renderListItems(items: ListItem[], ordered: boolean): React.ReactNode {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className={ordered ? "list-decimal" : "list-disc"}>
      {items.map((item, j) => (
        <li key={j}>
          <span className="li-content">{renderInlineFormatting(item.text)}</span>
          {item.children && item.children.length > 0 && (
            renderListItems(item.children, !!item.childOrdered)
          )}
        </li>
      ))}
    </ListTag>
  );
}

/* ===== RENDER BLOCKS ===== */
function renderBlock(block: ParsedBlock, index: number): React.ReactNode {
  switch (block.type) {
    case "heading": {
      const Tag = (`h${block.level}` as "h1" | "h2" | "h3");
      return <Tag key={index}>{renderInlineFormatting(block.content)}</Tag>;
    }

    case "code":
      return <CodeBlock key={index} language={block.meta} code={block.content} />;

    case "callout":
      return (
        <Callout key={index} type={block.calloutType!} title={block.meta}>
          {block.calloutBlocks && block.calloutBlocks.length > 0
            ? block.calloutBlocks.map((b, i) => renderBlock(b, i))
            : renderInlineFormatting(block.content)
          }
        </Callout>
      );

    case "list":
      return <div key={index}>{renderListItems(block.items || [], !!block.ordered)}</div>;

    case "blockquote": {
      const quoteBlocks = parseContent(block.content);
      return (
        <blockquote key={index}>
          {quoteBlocks.map((b, i) => renderBlock(b, i))}
        </blockquote>
      );
    }

    case "hr":
      return <hr key={index} />;

    case "table":
      return (
        <div key={index} className="table-card overflow-x-auto">
          <table>
            <thead>
              <tr>
                {block.rows?.[0]?.map((cell, j) => (
                  <th key={j}>{renderInlineFormatting(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.slice(1).map((row, j) => (
                <tr key={j}>
                  {row.map((cell, k) => (
                    <td key={k}>{renderInlineFormatting(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "paragraph":
    default:
      return <p key={index}>{renderInlineFormatting(block.content)}</p>;
  }
}

/* ===== MAIN RENDERER ===== */
export default function ChatMessageRenderer({ content }: { content: string }) {
  if (!content) return null;

  const blocks = parseContent(content);

  return (
    <div className="msg-ai-content text-[15px] sm:text-base leading-relaxed select-text">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

export { Callout, CodeBlock, CALLOUT_CONFIG };
export type { CalloutType };
