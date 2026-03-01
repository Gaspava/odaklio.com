"use client";

import { ReactNode, useMemo } from "react";
import { ContentBlock, CodeBlock, StepItem, BlockType } from "./RichContentBlocks";

interface MessageRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Parsed segment types
type Segment =
  | { type: "text"; content: string }
  | { type: "block"; blockType: BlockType; title?: string; content: string }
  | { type: "code"; language?: string; content: string }
  | { type: "steps"; items: string[] };

function parseContent(raw: string): Segment[] {
  const segments: Segment[] = [];
  const lines = raw.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for content block: :::type or :::type Title
    const blockMatch = line.match(/^:::(danger|warning|info|note|tip|success|quote|example|formula|definition)(?:\s+(.+))?$/);
    if (blockMatch) {
      const blockType = blockMatch[1] as BlockType;
      const title = blockMatch[2] || undefined;
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        blockLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::
      segments.push({ type: "block", blockType, title, content: blockLines.join("\n").trim() });
      continue;
    }

    // Check for code block: ```language
    const codeMatch = line.match(/^```(\w*)$/);
    if (codeMatch) {
      const language = codeMatch[1] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      segments.push({ type: "code", language, content: codeLines.join("\n") });
      continue;
    }

    // Check for numbered steps (consecutive lines starting with 1. 2. 3. etc.)
    const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch) {
      const items: string[] = [stepMatch[2]];
      i++;
      while (i < lines.length) {
        const nextStep = lines[i].match(/^(\d+)\.\s+(.+)$/);
        if (nextStep) {
          items.push(nextStep[2]);
          i++;
        } else {
          break;
        }
      }
      // Only treat as steps if there are 2+ items
      if (items.length >= 2) {
        segments.push({ type: "steps", items });
      } else {
        // Revert: treat as normal text
        segments.push({ type: "text", content: `${stepMatch[0]}` });
        // i is already advanced
      }
      continue;
    }

    // Regular text line
    // Accumulate consecutive text lines
    const textLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (
        nextLine.match(/^:::(danger|warning|info|note|tip|success|quote|example|formula|definition)/) ||
        nextLine.match(/^```/) ||
        nextLine.match(/^\d+\.\s+/)
      ) {
        break;
      }
      textLines.push(nextLine);
      i++;
    }
    const text = textLines.join("\n").trim();
    if (text) {
      segments.push({ type: "text", content: text });
    }
  }

  return segments;
}

// Render inline formatting: **bold**, *italic*, `code`, ~~strike~~, ==highlight==
function renderInlineFormatting(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Pattern: **bold**, *italic*, `inline code`, ~~strikethrough~~, ==highlight==
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\~\~(.+?)\~\~)|(==(.+?)==)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      parts.push(<strong key={key++} className="font-semibold" style={{ color: "var(--text-primary)" }}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++} className="italic" style={{ color: "var(--text-secondary)" }}>{match[4]}</em>);
    } else if (match[5]) {
      // `inline code`
      parts.push(<code key={key++} className="inline-code">{match[6]}</code>);
    } else if (match[7]) {
      // ~~strikethrough~~
      parts.push(<del key={key++} style={{ color: "var(--text-tertiary)" }}>{match[8]}</del>);
    } else if (match[9]) {
      // ==highlight==
      parts.push(<mark key={key++} className="text-highlight">{match[10]}</mark>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Render a text segment with headers, bullet points, and inline formatting
function renderTextSegment(text: string): ReactNode {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      elements.push(
        <h3 key={i} className="msg-h3">{renderInlineFormatting(h3Match[1])}</h3>
      );
      continue;
    }
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      elements.push(
        <h2 key={i} className="msg-h2">{renderInlineFormatting(h2Match[1])}</h2>
      );
      continue;
    }
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      elements.push(
        <h1 key={i} className="msg-h1">{renderInlineFormatting(h1Match[1])}</h1>
      );
      continue;
    }

    // Bullet points (- or *)
    const bulletMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="msg-bullet">
          <span className="msg-bullet-dot" />
          <span>{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="msg-hr" />);
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular text
    elements.push(
      <p key={i} className="msg-text">{renderInlineFormatting(line)}</p>
    );
  }

  return <>{elements}</>;
}

export default function MessageRenderer({ content, isStreaming }: MessageRendererProps) {
  const segments = useMemo(() => parseContent(content), [content]);

  if (!content && isStreaming) {
    return (
      <div className="typing-indicator">
        <span className="typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  return (
    <div className="message-content">
      {segments.map((seg, idx) => {
        switch (seg.type) {
          case "block":
            return (
              <ContentBlock key={idx} type={seg.blockType} title={seg.title}>
                {renderTextSegment(seg.content)}
              </ContentBlock>
            );
          case "code":
            return <CodeBlock key={idx} code={seg.content} language={seg.language} />;
          case "steps":
            return (
              <div key={idx} className="steps-container">
                {seg.items.map((item, sIdx) => (
                  <StepItem key={sIdx} number={sIdx + 1}>
                    {renderInlineFormatting(item)}
                  </StepItem>
                ))}
              </div>
            );
          case "text":
            return <div key={idx}>{renderTextSegment(seg.content)}</div>;
          default:
            return null;
        }
      })}
      {isStreaming && content && (
        <span className="streaming-cursor" />
      )}
    </div>
  );
}
