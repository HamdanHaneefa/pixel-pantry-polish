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
