import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";

export interface SponsorBrand {
  id: string;
  name: string;
  logo: string;
  link?: string | undefined;
}

function getSponsorsFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "sponsors.json");
}

function loadSponsors(): SponsorBrand[] {
  try {
    const file = getSponsorsFilePath();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw) as SponsorBrand[];
    }
  } catch (err) {
    console.warn("[loadSponsors] Error reading file:", err);
  }
  return [];
}

function writeSponsors(sponsors: SponsorBrand[]): void {
  try {
    const file = getSponsorsFilePath();
    fs.writeFileSync(file, JSON.stringify(sponsors, null, 2), "utf-8");
  } catch (err) {
    console.error("[writeSponsors] Error writing file:", err);
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
