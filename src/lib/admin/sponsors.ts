import { createServerFn } from "@tanstack/react-start";
import defaultSponsors from "@/data/sponsors.json";

export interface SponsorBrand {
  id: string;
  name: string;
  logo: string;
  link?: string | undefined;
}

let inMemorySponsors: SponsorBrand[] = Array.isArray(defaultSponsors)
  ? [...(defaultSponsors as SponsorBrand[])]
  : [];

function loadSponsors(): SponsorBrand[] {
  return inMemorySponsors;
}

function writeSponsors(sponsors: SponsorBrand[]): void {
  inMemorySponsors = [...sponsors];
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      import("node:fs").then((fs) => {
        import("node:path").then((path) => {
          const file = path.resolve(process.cwd(), "src", "data", "sponsors.json");
          fs.writeFileSync(file, JSON.stringify(sponsors, null, 2), "utf-8");
        }).catch(() => {});
      }).catch(() => {});
    } catch {
      // Non-fatal in edge/browser environments
    }
  }
}

export const getSponsorsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SponsorBrand[]> => {
    return loadSponsors();
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
    const sponsors = loadSponsors();
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newSponsor: SponsorBrand = {
      id,
      name: data.name.trim(),
      logo: data.logo.trim(),
      link: data.link?.trim() || `/shop?vendor=${encodeURIComponent(data.name.trim())}`,
    };

    const idx = sponsors.findIndex((s) => s.id === id);
    if (idx > -1) {
      sponsors[idx] = newSponsor;
    } else {
      sponsors.push(newSponsor);
    }

    writeSponsors(sponsors);
    return { success: true, sponsor: newSponsor };
  });

export const deleteSponsorFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sponsors = loadSponsors();
    const filtered = sponsors.filter((s) => s.id !== data.id);
    writeSponsors(filtered);
    return { success: true };
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

      const base64Clean = data.base64Data.replace(/^data:image\/[a-z+]+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      // 1. Try writing locally to server (/public/uploads/)
      let localUrl = `/uploads/${finalName}`;
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, finalName);
        fs.writeFileSync(filePath, buffer);
      } catch (fsErr) {
        console.warn("[uploadSponsorLogoFn] Local filesystem write skipped or read-only:", fsErr);
      }

      // 2. Upload to Shopify via Staged Uploads API
      let shopifyUrl: string | null = null;
      try {
        const { uploadImageToShopify } = await import("./products");
        shopifyUrl = await uploadImageToShopify(buffer, finalName, data.contentType || "image/png");
      } catch (shopErr) {
        console.warn("[uploadSponsorLogoFn] Shopify staged upload failed:", shopErr);
      }

      const finalUrl = shopifyUrl || localUrl;

      return {
        success: true,
        url: finalUrl,
        shopifyUrl: shopifyUrl || undefined,
        localUrl,
        filename: finalName,
      };
    } catch (err: any) {
      console.error("[uploadSponsorLogoFn] Error:", err);
      return { success: false, error: err.message || "Failed to upload sponsor logo" };
    }
  });

