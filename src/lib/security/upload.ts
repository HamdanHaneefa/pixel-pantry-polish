/**
 * Strict image upload validation and security module.
 * Protects against:
 * - Unrestricted file upload vulnerabilities
 * - Stored XSS via SVG or polyglot files
 * - Denial of Service via oversized files
 * - Extension/MIME spoofing via magic byte verification
 * - Path traversal in uploaded filenames
 */

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;
export type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export interface ValidatedImageUpload {
  buffer: Buffer;
  cleanFilename: string;
  extension: AllowedImageExtension;
  mimeType: AllowedImageMimeType;
  sizeBytes: number;
}

/**
 * Validates the magic byte signatures for binary image files.
 * Rejects SVGs, HTML, scripts, executable files, and corrupted headers.
 */
export function verifyImageMagicBytes(buffer: Buffer): {
  isValid: boolean;
  detectedMime?: AllowedImageMimeType;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, error: "File buffer is too small or empty to be a valid image." };
  }

  // 1. Explicitly reject text/script headers (SVG, XML, HTML, etc.)
  const headerText = buffer.subarray(0, 512).toString("utf8").toLowerCase();
  if (
    headerText.includes("<svg") ||
    headerText.includes("<?xml") ||
    headerText.includes("<html") ||
    headerText.includes("<!doctype") ||
    headerText.includes("<script") ||
    headerText.includes("javascript:")
  ) {
    return {
      isValid: false,
      error: "SVG, XML, HTML, and script-based image formats are strictly forbidden.",
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedMime: "image/png" };
  }

  // 3. JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedMime: "image/jpeg" };
  }

  // 4. GIF: GIF87a (47 49 46 38 37 61) or GIF89a (47 49 46 38 39 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { isValid: true, detectedMime: "image/gif" };
  }

  // 5. WEBP: RIFF .... WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, detectedMime: "image/webp" };
  }

  return {
    isValid: false,
    error: "File content does not match allowed image signatures (PNG, JPEG, WebP, GIF).",
  };
}

/**
 * Validates, checks, sanitizes and verifies an incoming base64 image upload.
 */
export function validateImageUpload(params: {
  filename: string;
  base64Data: string;
  contentType?: string;
  prefix?: string;
  maxBytes?: number;
}): ValidatedImageUpload {
  const {
    filename,
    base64Data,
    contentType,
    prefix = "upload",
    maxBytes = MAX_UPLOAD_SIZE_BYTES,
  } = params;

  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Missing or invalid image data.");
  }

  // Extract pure base64 payload
  const rawBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  if (!rawBase64) {
    throw new Error("Empty image payload.");
  }

  const buffer = Buffer.from(rawBase64, "base64");

  // Enforce size limits
  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty (0 bytes).");
  }

  if (buffer.length > maxBytes) {
    throw new Error(
      `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds strict maximum limit of ${(maxBytes / (1024 * 1024)).toFixed(1)} MB.`,
    );
  }

  // Validate file signature / magic bytes
  const signatureCheck = verifyImageMagicBytes(buffer);
  if (!signatureCheck.isValid || !signatureCheck.detectedMime) {
    throw new Error(signatureCheck.error || "File signature verification failed.");
  }

  // Validate declared Content-Type if supplied
  if (contentType) {
    const normContentType = contentType.toLowerCase().split(";")[0]?.trim();
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(normContentType as AllowedImageMimeType)) {
      throw new Error(
        `Disallowed content-type '${contentType}'. Only JPEG, PNG, WebP, and GIF are permitted.`,
      );
    }
    // Cross check declared MIME against detected signature
    if (normContentType !== signatureCheck.detectedMime) {
      // Allow image/jpeg vs image/jpg nuance
      const isJpegMismatch =
        (normContentType === "image/jpeg" || normContentType === "image/jpg") &&
        signatureCheck.detectedMime === "image/jpeg";
      if (!isJpegMismatch) {
        throw new Error(
          `Content-Type spoofing detected: header '${contentType}' does not match file signature '${signatureCheck.detectedMime}'.`,
        );
      }
    }
  }

  // Validate extension
  const cleanBase = (filename || "image")
    .replace(/^.*[\\/]/, "") // strip directory components
    .replace(/\0/g, ""); // strip null bytes

  const parts = cleanBase.split(".");
  const rawExt = parts.length > 1 ? "." + parts.pop()!.toLowerCase() : "";

  if (
    rawExt === ".svg" ||
    rawExt === ".html" ||
    rawExt === ".htm" ||
    rawExt === ".php" ||
    rawExt === ".js"
  ) {
    throw new Error(`Extension '${rawExt}' is strictly forbidden.`);
  }

  // Map detected mime to standard extension
  const mimeToExt: Record<AllowedImageMimeType, AllowedImageExtension> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  const detectedExt = mimeToExt[signatureCheck.detectedMime];
  const finalExt = ALLOWED_IMAGE_EXTENSIONS.includes(rawExt as AllowedImageExtension)
    ? (rawExt as AllowedImageExtension)
    : detectedExt;

  const sanitizedBasename =
    parts
      .join("")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 40) || "image";

  const cleanFilename = `${prefix}-${Date.now()}-${sanitizedBasename}${finalExt}`;

  return {
    buffer,
    cleanFilename,
    extension: finalExt,
    mimeType: signatureCheck.detectedMime,
    sizeBytes: buffer.length,
  };
}
