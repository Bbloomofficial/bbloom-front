import { useMemo } from "react";

const ALLOWED = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "UL",
  "OL",
  "LI",
  "A",
  "H2",
  "H3",
  "H4",
  "BLOCKQUOTE",
  "SPAN",
  "DIV",
]);

/** Client-authored HTML, reduced to a safe subset before it hits the DOM. */
function sanitize(html: string): string {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]+>/g, "");
  const doc = new DOMParser().parseFromString(
    `<div>${html}</div>`,
    "text/html",
  );
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const walk = (node: Element) => {
    for (const child of [...node.children]) {
      if (!ALLOWED.has(child.tagName)) {
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const attribute of [...child.attributes]) {
        const name = attribute.name.toLowerCase();
        const isSafeHref =
          name === "href" &&
          /^(https?:|mailto:|tel:|#|\/)/i.test(attribute.value.trim());
        if (!isSafeHref) child.removeAttribute(attribute.name);
      }
      if (child.tagName === "A") {
        child.setAttribute("target", "_blank");
        child.setAttribute("rel", "noreferrer noopener");
      }
      walk(child);
    }
  };

  walk(root);
  return root.innerHTML;
}

export function RichText({
  html,
  className = "",
}: {
  html?: string;
  className?: string;
}) {
  const safe = useMemo(() => (html ? sanitize(html) : ""), [html]);
  if (!safe) return null;

  // Plain paragraphs from a textarea arrive without markup.
  if (!/[<>]/.test(safe)) {
    return (
      <div className={className}>
        {safe.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-4" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`site-rich ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
