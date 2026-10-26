import React from "react";
import { site } from "../content";
import styles from "../styles/site.module.css";

type RichTextProps = {
  text: string;
  className?: string;
  onAnchorClick?: (url: string) => boolean;
};

function inlineNodes(
  text: string,
  paragraphKey: string,
  onAnchorClick?: RichTextProps["onAnchorClick"],
) {
  const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${paragraphKey}-bold-${tokenIndex}`}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const closing = token.lastIndexOf("](");
      const label = token.slice(1, closing);
      const url = token.slice(closing + 2, -1);
      const external = url.startsWith("https:");
      nodes.push(
        <a
          href={url}
          key={`${paragraphKey}-link-${tokenIndex}`}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener" : undefined}
          onClick={(event) => {
            if (onAnchorClick?.(url)) event.preventDefault();
          }}
        >
          {label}
          {external && (
            <span className="sr-only">
              {site.accessibility.externalLinkText}
            </span>
          )}
        </a>,
      );
    }

    cursor = index + token.length;
    tokenIndex += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function RichText({ text, className, onAnchorClick }: RichTextProps) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className={className ?? styles.richText}>
      {paragraphs.map((paragraph, index) => (
        <p key={`paragraph-${index}`}>
          {inlineNodes(paragraph, `paragraph-${index}`, onAnchorClick)}
        </p>
      ))}
    </div>
  );
}
