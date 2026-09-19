import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  getSponsorsFn,
  saveSponsorFn,
  deleteSponsorFn,
  uploadSponsorLogoFn,
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
  UploadCloud,
  Upload,
  CheckCircle2,
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

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditingSponsor(null);
    setName("");
    setLogo("");
    setLink("");
    setError(null);
    setIsUploading(false);
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const openEdit = (s: SponsorBrand) => {
    setEditingSponsor(s);
    setName(s.name);
    setLogo(s.logo);
    setLink(s.link || "");
    setError(null);
    setIsUploading(false);
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setError(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await uploadSponsorLogoFn({
        data: {
          filename: file.name,
          base64Data,
          contentType: file.type,
        },
      });

      if (res.success && res.url) {
        setLogo(res.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } else {
        setError(res.error || "Failed to upload logo image.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
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
                  Brand / Sponsor Logo <span className="text-red-500">*</span>
                </label>

                {/* Upload from local device area */}
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer ${
                    isUploading
                      ? "border-orange-400 bg-orange-50/40 cursor-wait"
                      : uploadSuccess
                      ? "border-emerald-500 bg-emerald-50/40"
                      : isDragging
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-300 hover:border-orange-400 hover:bg-orange-50/20 bg-slate-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <p className="text-xs font-bold text-orange-700">
                        Uploading to Server & Shopify CDN...
                      </p>
                      <p className="text-[11px] text-slate-500">Processing file, please wait</p>
                    </div>
                  ) : logo ? (
                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
                          <img
                            src={logo}
                            alt="Logo preview"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          {uploadSuccess ? (
                            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              Uploaded to Shopify & Server!
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              Logo Attached
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-[220px]">
                            {logo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-2 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        Click to upload logo from your device
                      </p>
                      <p className="text-[11px] text-slate-500">
                        PNG, JPG, WEBP, SVG • Uploads to Server & Shopify
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct URL input fallback */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      Or edit / paste Image URL manually:
                    </span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://cdn.shopify.com/.../logo.png"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
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
