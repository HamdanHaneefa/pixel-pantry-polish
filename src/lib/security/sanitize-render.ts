import { sanitizeProductHtml } from "./sanitize";

/**
 * Sanitizer for HTML rendered in components (product page, admin preview).
 *
 * Uses the same `sanitize-html` rules as the server. (A jsdom-based DOMPurify was tried here,
 * but jsdom crashes the production server bundle, so it must not be used.)
 */
export function sanitizeHtmlForRender(dirtyHtml?: string | null): string {
  return sanitizeProductHtml(dirtyHtml);
}
