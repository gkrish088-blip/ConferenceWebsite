import type { MouseEvent } from "react";
import { site } from "../content";

export type LinkSlot = { label: string; url: string; placeholder: boolean };

export function ContentLink({
  link,
  className,
}: {
  link: LinkSlot;
  className: string;
}) {
  const external = link.url.startsWith("https:");
  const blockPlaceholder = (event: MouseEvent<HTMLAnchorElement>) => {
    if (link.placeholder) event.preventDefault();
  };

  return (
    <a
      className={className}
      href={link.url}
      aria-disabled={link.placeholder || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      onClick={blockPlaceholder}
    >
      {link.label}
      {external && (
        <span className="sr-only">{site.accessibility.externalLinkText}</span>
      )}
    </a>
  );
}
