import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  getSponsorsFn,
  saveSponsorFn,
  deleteSponsorFn,
  SponsorBrand,
} from "@/lib/admin/sponsors";
import {
  Award,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin/sponsors")({
  loader: async () => {
    const sponsors = await getSponsorsFn();
    return { sponsors };
  },
  component: AdminSponsorsPage,
});

function AdminSponsorsPage() {
  const { sponsors: initialSponsors } = Route.useLoaderData();
  const [sponsors, setSponsors] = useState<SponsorBrand[]>(initialSponsors);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<SponsorBrand | null>(null);

  // Form
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingSponsor(null);
    setName("");
    setLogo("");
    setLink("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (s: SponsorBrand) => {
    setEditingSponsor(s);
    setName(s.name);
    setLogo(s.logo);
    setLink(s.link || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor/brand?")) return;
    try {
      await deleteSponsorFn({ data: { id } });
      setSponsors((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !logo.trim()) {
      setError("Name and Logo URL are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await saveSponsorFn({
        data: {
          id: editingSponsor?.id,
          name: name.trim(),
          logo: logo.trim(),
          link: link.trim() || undefined,
        },
      });

      if (res.success && res.sponsor) {
        setSponsors((prev) => {
          const idx = prev.findIndex((s) => s.id === res.sponsor.id);
          if (idx > -1) {
            const copy = [...prev];
            copy[idx] = res.sponsor;
            return copy;
          }
          return [...prev, res.sponsor];
        });
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save sponsor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sponsors & Top Brands
          </h1>
          <p className="text-sm text-slate-500">
            Manage partner logos and brands displayed on the homepage "Top Brands We Love" section.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.99]"
        >
          <PlusCircle className="h-4 w-4" />
          Add Brand / Sponsor
        </button>
      </div>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex h-24 w-full items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-3 mb-4">
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt={s.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="font-bold text-slate-400">{s.name}</span>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900">{s.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Link: {s.link || `/shop?vendor=${s.name}`}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
              <a
                href={s.link || `/shop?vendor=${s.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <ExternalLink className="h-3 w-3" /> Visit Link
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(s)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  title="Edit Sponsor"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete Sponsor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-900">
                {editingSponsor ? "Edit Sponsor / Brand" : "Add Sponsor / Brand"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Brand / Sponsor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Canin, Drools, Pedigree"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Logo Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.shopify.com/.../logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
                {logo && (
                  <div className="mt-2 flex h-14 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <img
                      src={logo}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Target Store Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/shop?vendor=BrandName"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {editingSponsor ? "Update Sponsor" : "Add Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
