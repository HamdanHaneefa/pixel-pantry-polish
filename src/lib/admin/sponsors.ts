import { createServerFn } from "@tanstack/react-start";
import defaultSponsors from "@/data/sponsors.json";

export interface SponsorBrand {
  id: string;
  name: string;
  logo: string;
  link?: string | undefined;
}

let inMemorySponsors: SponsorBrand[] | null = null;

async function loadSponsors(): Promise<SponsorBrand[]> {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "sponsors.json");
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemorySponsors = parsed;
          return inMemorySponsors;
        }
      }
    } catch (err) {
      console.warn("[loadSponsors] Error reading sponsors.json:", err);
    }
  }

  if (inMemorySponsors !== null) {
    return inMemorySponsors;
  }

  inMemorySponsors = Array.isArray(defaultSponsors)
    ? [...(defaultSponsors as SponsorBrand[])]
    : [];

  return inMemorySponsors;
}

async function writeSponsors(sponsors: SponsorBrand[]): Promise<void> {
  inMemorySponsors = [...sponsors];
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const targetPaths = [
        path.resolve(process.cwd(), "src", "data", "sponsors.json"),
        path.resolve(process.cwd(), "public", "data", "sponsors.json"),
      ];

      for (const file of targetPaths) {
        try {
          const dir = path.dirname(file);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(file, JSON.stringify(sponsors, null, 2), "utf-8");
        } catch {
          // ignore individual path write errors
        }
      }
    } catch (err) {
      console.warn("[writeSponsors] Failed to write sponsors.json:", err);
    }
  }
}

export const getSponsorsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SponsorBrand[]> => {
    return await loadSponsors();
  }
);

interface SaveSponsorPayload {
  id?: string | undefined;
  name: string;
  logo: string;
  link?: string | undefined;
}

export const saveSponsorFn = createServerFn({ method: "POST" })
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
        (s?.name || "").toLowerCase() === newSponsor.name.toLowerCase()
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
  .validator((data: UploadSponsorLogoPayload) => data)
  .handler(async ({ data }) => {
    try {
      const ext = data.filename.includes(".")
        ? `.${data.filename.split(".").pop()}`
        : ".png";
      const cleanName = data.filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      const finalName = `sponsor-${Date.now()}-${cleanName}${ext}`;

      const base64Clean = data.base64Data.includes(",")
        ? data.base64Data.split(",")[1] || ""
        : data.base64Data;
      const buffer = Buffer.from(base64Clean, "base64");

      // 1. Write locally to /public/uploads/ for fast static serving
      let publicUrl: string | null = null;
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
        console.warn("[uploadSponsorLogoFn] Local filesystem write skipped or read-only:", fsErr);
      }

      // If local file write succeeded, return the clean public static URL
      // If filesystem is read-only, fallback to data URI so it ALWAYS works everywhere
      const finalUrl = publicUrl || data.base64Data;

      return {
        success: true,
        url: finalUrl,
        localUrl: publicUrl || undefined,
        filename: finalName,
      };
    } catch (err: any) {
      console.error("[uploadSponsorLogoFn] Error:", err);
      return { success: false, error: err.message || "Failed to upload sponsor logo" };
    }
  });
