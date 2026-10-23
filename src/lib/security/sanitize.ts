import sanitizeHtml from "sanitize-html";

/**
 * Strict HTML sanitization configuration for product descriptions and rich user input.
 * Strips all active executable content (<script>, <iframe>, <object>, etc.), inline event handlers (onerror, onclick),
 * unsafe protocols (javascript:, vbscript:, data:text/html), and unlisted tags/attributes.
 */
const SANITIZER_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "a",
    "ul",
    "ol",
    "nl",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "strike",
    "code",
    "hr",
    "br",
    "div",
    "table",
    "thead",
    "caption",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "span",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title", "class"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class"],
    div: ["class"],
    span: ["class"],
    p: ["class"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
    h5: ["class"],
    h6: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    table: ["class"],
    th: ["class"],
    td: ["class"],
    tr: ["class"],
  },
  selfClosing: ["img", "br", "hr"],
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      // Force safe rel for links that open in new window or target external sites
      const newAttribs = { ...attribs };
      if (newAttribs.target === "_blank") {
        newAttribs.rel = "noopener noreferrer nofollow";
      }
      return {
        tagName,
        attribs: newAttribs,
      };
    },
  },
  disallowedTagsMode: "discard",
};

/**
 * Safely sanitizes product description HTML to prevent Stored XSS.
 * Can be safely called in SSR, API endpoints, or client components.
 */
export function sanitizeProductHtml(dirtyHtml?: string | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }
  const trimmed = dirtyHtml.trim();
  if (!trimmed) {
    return "";
  }
  return sanitizeHtml(trimmed, SANITIZER_OPTIONS);
}
