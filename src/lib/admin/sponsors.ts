import { createServerFn } from "@tanstack/react-start";
import defaultSponsors from "@/data/sponsors.json";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";
import { validateImageUpload } from "@/lib/security/upload";

export interface SponsorBrand {
  id: string;
  name: string;
  logo: string;
  link?: string | undefined;
}

let inMemorySponsors: SponsorBrand[] | null = null;

async function loadSponsors(): Promise<SponsorBrand[]> {
  const fallback: SponsorBrand[] =
    inMemorySponsors || (Array.isArray(defaultSponsors) ? (defaultSponsors as SponsorBrand[]) : []);
  const loaded = await storageGet<SponsorBrand[]>("sponsors", fallback);
  inMemorySponsors = loaded;
  return loaded;
}

async function writeSponsors(sponsors: SponsorBrand[]): Promise<void> {
  inMemorySponsors = [...sponsors];
  await storageSet("sponsors", sponsors);
}

export const getSponsorsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SponsorBrand[]> => {
    return await loadSponsors();
  },
);

interface SaveSponsorPayload {
  id?: string | undefined;
  name: string;
  logo: string;
  link?: string | undefined;
}

export const saveSponsorFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: SaveSponsorPayload) => data)
  .handler(async ({ data }) => {
    const sponsors = await loadSponsors();
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newSponsor: SponsorBrand = {
      id,
      name: data.name.trim(),
      logo: data.logo.trim(),
      link: data.link?.trim() || undefined,
    };

    const idx = sponsors.findIndex(
      (s) =>
        (s?.id || "").toLowerCase() === id.toLowerCase() ||
        (s?.name || "").toLowerCase() === newSponsor.name.toLowerCase(),
    );
    if (idx > -1) {
      sponsors[idx] = newSponsor;
    } else {
      sponsors.push(newSponsor);
    }

    await writeSponsors(sponsors);
    return { success: true, sponsor: newSponsor };
  });

export const deleteSponsorFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sponsors = await loadSponsors();
    const rawTarget = (data?.id || "").trim().toLowerCase();
    const targetClean = rawTarget.replace(/[^a-z0-9]/g, "");

    const filtered = sponsors.filter((s) => {
      const sId = (s?.id || "").trim().toLowerCase();
      const sName = (s?.name || "").trim().toLowerCase();
      const sIdClean = sId.replace(/[^a-z0-9]/g, "");
      const sNameClean = sName.replace(/[^a-z0-9]/g, "");

      const isMatch =
        sId === rawTarget ||
        sName === rawTarget ||
        (targetClean.length > 0 && (sIdClean === targetClean || sNameClean === targetClean));

      return !isMatch;
    });

    await writeSponsors(filtered);
    return { success: true, count: filtered.length, deletedId: data.id };
  });

export interface UploadSponsorLogoPayload {
  filename: string;
  base64Data: string;
  contentType: string;
}

export const uploadSponsorLogoFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: UploadSponsorLogoPayload) => data)
  .handler(async ({ data }) => {
    try {
      // Strict image validation: magic bytes, MIME, extension, size limit (5MB max)
      const validated = validateImageUpload({
        filename: data.filename || "sponsor-logo",
        base64Data: data.base64Data,
        contentType: data.contentType,
        prefix: "sponsor",
      });

      const finalName = validated.cleanFilename;
      const buffer = validated.buffer;
      const mimeType = validated.mimeType;

      // 1. Write locally only in development when not on serverless
      let publicUrl: string | null = null;
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (!isServerless && process.env.NODE_ENV !== "production") {
        try {
          const fs = await import("node:fs");
          const path = await import("node:path");
          const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filePath = path.join(uploadsDir, finalName);
          fs.writeFileSync(filePath, buffer);
          publicUrl = `/uploads/${finalName}`;
        } catch (fsErr) {
          console.warn("[uploadSponsorLogoFn] Local filesystem write skipped:", fsErr);
        }
      }

      const safeDataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
      const finalUrl = publicUrl || safeDataUri;

      return {
        success: true,
        url: finalUrl,
        localUrl: publicUrl || undefined,
        filename: finalName,
        mimeType,
        sizeBytes: validated.sizeBytes,
      };
    } catch (err: any) {
      console.error("[uploadSponsorLogoFn] Validation/Upload error:", err);
      return { success: false, error: err.message || "Failed to upload sponsor logo" };
    }
  });
