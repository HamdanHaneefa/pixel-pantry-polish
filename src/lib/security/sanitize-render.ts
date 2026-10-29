import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizer for HTML rendered in components (product page, admin preview). Uses DOMPurify,
 * which runs natively in the browser (and via jsdom during SSR), so the Node-only
 * `sanitize-html` library stays out of the client bundle. Same allowlist as
 * `sanitizeProductHtml` in ./sanitize.ts (used on the server).
 */
const ALLOWED_TAGS = [
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
];
const ALLOWED_ATTR = [
  "href",
  "name",
  "target",
  "rel",
  "title",
  "class",
  "src",
  "srcset",
  "alt",
  "width",
  "height",
  "loading",
];

let hookAdded = false;

export function sanitizeHtmlForRender(dirtyHtml?: string | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string" || !dirtyHtml.trim()) return "";
  if (!hookAdded) {
    // Links that open a new tab get a safe rel, matching the server sanitizer
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer nofollow");
      }
    });
    hookAdded = true;
  }
  return DOMPurify.sanitize(dirtyHtml.trim(), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target"],
  });
}
