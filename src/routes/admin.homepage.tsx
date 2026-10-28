import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CheckCircle2,
  ExternalLink,
  GalleryHorizontal,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  MessageSquareQuote,
  PlusCircle,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { getHomepageContentFn, saveHomepageSectionFn } from "@/lib/admin/homepage";
import { getSponsorsFn } from "@/lib/admin/sponsors";
import { uploadProductImageFn } from "@/lib/admin/products";
import SponsorsManager from "@/components/admin/SponsorsManager";
import {
  resolveHomepageContent,
  type FeatureBanner,
  type HeroSlide,
  type HomepageContent,
  type HomepageSectionKey,
  type PromoCard,
  type Testimonial,
  type TestimonialsSection,
} from "@/data/homepageContent";

type TabKey = HomepageSectionKey | "brands";

const TABS: Array<{ key: TabKey; label: string; icon: typeof ImageIcon }> = [
  { key: "heroSlides", label: "Hero Slides", icon: GalleryHorizontal },
  { key: "promoCards", label: "Promo Cards", icon: LayoutTemplate },
  { key: "featureBanner", label: "Feature Banner", icon: ImageIcon },
  { key: "brands", label: "Brands & Sponsors", icon: Award },
  { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

export const Route = createFileRoute("/admin/homepage")({
  validateSearch: (search: Record<string, unknown>): { tab?: TabKey } => {
    const tab = TABS.find((t) => t.key === search.tab)?.key;
    return tab ? { tab } : {};
  },
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
  loader: async () => {
    const [stored, sponsors] = await Promise.all([
      getHomepageContentFn().catch(() => ({})),
      getSponsorsFn().catch(() => []),
    ]);
    return { stored: stored || {}, sponsors };
  },
  component: StorefrontDesignPage,
});

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

function StorefrontDesignPage() {
  const router = useRouter();
  const navigate = useNavigate({ from: Route.fullPath });
  const { stored, sponsors } = Route.useLoaderData();
  const tab: TabKey = Route.useSearch().tab ?? "heroSlides";
  const [storedContent, setStoredContent] = useState<Partial<HomepageContent>>(stored);
  const [draft, setDraft] = useState<HomepageContent>(() => resolveHomepageContent(stored));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setStoredContent(stored);
    setDraft(resolveHomepageContent(stored));
  }, [stored]);

  const section = tab === "brands" ? null : tab;
  const isCustomised = (key: HomepageSectionKey) => storedContent[key] !== undefined;
  const isDirty =
    section !== null &&
    JSON.stringify(draft[section]) !==
      JSON.stringify(resolveHomepageContent(storedContent)[section]);

  const selectTab = (key: TabKey) => {
    if (isDirty && !confirm("You have unsaved changes on this tab. Leave without saving?")) return;
    setDraft(resolveHomepageContent(storedContent));
    setMessage(null);
    navigate({ search: { tab: key }, replace: true });
  };

  const save = async (value: unknown) => {
    if (!section) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await saveHomepageSectionFn({ data: { section, value } });
      if (!res.success) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setStoredContent(res.content);
      setDraft(resolveHomepageContent(res.content));
      setMessage({
        type: "success",
        text: value === null ? "Restored the default content." : "Saved — live on the homepage.",
      });
      await router.invalidate();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends HomepageSectionKey>(key: K, value: HomepageContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Storefront Design</h1>
          <p className="text-sm text-slate-500">
            Banners, brand logos and testimonials shown on the homepage.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          View Homepage
        </a>
      </div>

      {/* Tabs */}
      <div className="-mx-1 overflow-x-auto border-b border-slate-200 no-scrollbar">
        <div className="flex min-w-max gap-1 px-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => selectTab(t.key)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "border-orange-500 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-orange-500" : ""}`} />
                {t.label}
                {t.key !== "brands" && isCustomised(t.key) && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-orange-400"
                    title="Customised (not using the default)"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "brands" ? (
        <SponsorsManager initialSponsors={sponsors} />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs">
          <div className="space-y-5 p-5 md:p-6">
            {tab === "heroSlides" && (
              <HeroSlidesEditor
                value={draft.heroSlides}
                onChange={(v) => update("heroSlides", v)}
              />
            )}
            {tab === "promoCards" && (
              <PromoCardsEditor
                value={draft.promoCards}
                onChange={(v) => update("promoCards", v)}
              />
            )}
            {tab === "featureBanner" && (
              <FeatureBannerEditor
                value={draft.featureBanner}
                onChange={(v) => update("featureBanner", v)}
              />
            )}
            {tab === "testimonials" && (
              <TestimonialsEditor
                value={draft.testimonials}
                onChange={(v) => update("testimonials", v)}
              />
            )}
          </div>

          {/* Save bar */}
          <div className="sticky bottom-0 flex flex-col gap-3 rounded-b-lg border-t border-slate-200 bg-slate-50/95 px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="min-h-5 text-sm">
              {message ? (
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    message.type === "success" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {message.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                  {message.text}
                </span>
              ) : isDirty ? (
                <span className="font-medium text-amber-600">You have unsaved changes</span>
              ) : (
                <span className="text-slate-500">All changes saved</span>
              )}
            </div>
            <div className="flex gap-2">
              {section && isCustomised(section) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (confirm("Restore this section to the original default content?"))
                      save(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore default
                </button>
              )}
              <button
                type="button"
                disabled={saving || !isDirty}
                onClick={() => setDraft(resolveHomepageContent(storedContent))}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={saving || !isDirty}
                onClick={() => section && save(draft[section])}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section editors                                                            */
/* -------------------------------------------------------------------------- */

function HeroSlidesEditor({
  value,
  onChange,
}: {
  value: HeroSlide[];
  onChange: (v: HeroSlide[]) => void;
}) {
  return (
    <ListEditor
      title="Hero Slides"
      description="The large rotating banners at the top of the homepage. Recommended size 2048×730 (desktop) and 888×744 (mobile)."
      items={value}
      onChange={onChange}
      addLabel="Add slide"
      createItem={(): HeroSlide => ({
        id: newId("slide"),
        image: "",
        alt: "",
        link: "/shop",
        btnText: "Shop Now",
        btnColor: "#FF5500",
        showButton: true,
        showButtonOnMobile: true,
      })}
      renderItem={(slide, set) => (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageInput
              label="Desktop image"
              value={slide.image}
              onChange={(image) => set({ ...slide, image })}
              aspect="aspect-[1024/365]"
            />
            <ImageInput
              label="Mobile image (optional)"
              value={slide.mobileImage || ""}
              onChange={(mobileImage) => set({ ...slide, mobileImage: mobileImage || undefined })}
              aspect="aspect-[444/372]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Description (for accessibility & SEO)"
              value={slide.alt}
              onChange={(alt) => set({ ...slide, alt })}
              className="sm:col-span-2"
            />
            <TextInput
              label="Link"
              value={slide.link}
              onChange={(link) => set({ ...slide, link })}
            />
            <TextInput
              label="Button text"
              value={slide.btnText}
              onChange={(btnText) => set({ ...slide, btnText })}
            />
            <ColorInput
              label="Button colour"
              value={slide.btnColor}
              onChange={(btnColor) => set({ ...slide, btnColor })}
            />
            <div className="flex flex-col justify-end gap-2 pb-1">
              <Toggle
                label="Show button"
                checked={slide.showButton}
                onChange={(showButton) => set({ ...slide, showButton })}
              />
              <Toggle
                label="Show button on mobile"
                checked={slide.showButtonOnMobile}
                onChange={(showButtonOnMobile) => set({ ...slide, showButtonOnMobile })}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}

function PromoCardsEditor({
  value,
  onChange,
}: {
  value: PromoCard[];
  onChange: (v: PromoCard[]) => void;
}) {
  return (
    <ListEditor
      title="Promo Cards"
      description="The row of brand banners (3 visible on desktop). Recommended size 1350×1200."
      items={value}
      onChange={onChange}
      addLabel="Add card"
      createItem={() => ({
        id: newId("promo"),
        title: "",
        image: "",
        link: "/shop",
        bgColor: "#FFF3E2",
      })}
      renderItem={(card, set) => (
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <ImageInput
            label="Image"
            value={card.image}
            onChange={(image) => set({ ...card, image })}
            aspect="aspect-[9/8]"
          />
          <div className="grid content-start gap-3 sm:grid-cols-2">
            <TextInput
              label="Title"
              value={card.title}
              onChange={(title) => set({ ...card, title })}
              className="sm:col-span-2"
            />
            <TextInput label="Link" value={card.link} onChange={(link) => set({ ...card, link })} />
            <ColorInput
              label="Background colour"
              value={card.bgColor}
              onChange={(bgColor) => set({ ...card, bgColor })}
            />
          </div>
        </div>
      )}
    />
  );
}

function FeatureBannerEditor({
  value: b,
  onChange,
}: {
  value: FeatureBanner;
  onChange: (v: FeatureBanner) => void;
}) {
  const set = (patch: Partial<FeatureBanner>) => onChange({ ...b, ...patch });
  return (
    <div className="space-y-5">
      <SectionIntro
        title="Feature Banner"
        description="The wide offer banner in the middle of the homepage. Recommended size 1600×640."
      />

      {/* Live preview */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ backgroundColor: b.bgColor, opacity: b.enabled ? 1 : 0.5 }}
      >
        {b.image && <img src={b.image} alt="" className="h-[200px] w-full object-cover" />}
        <div
          className="absolute inset-0 flex items-center justify-between px-6"
          style={{
            background: `linear-gradient(90deg, ${b.bgColor} 0%, color-mix(in srgb, ${b.bgColor} 85%, transparent) 30%, transparent 55%, color-mix(in srgb, ${b.bgColor} 85%, transparent) 78%)`,
          }}
        >
          <div>
            <p className="text-2xl font-extrabold leading-tight text-white">
              {b.headingLine1}
              <br />
              <span style={{ color: b.accentColor }}>{b.headingLine2}</span>
            </p>
            <p className="mt-1 max-w-[220px] text-xs text-white/90">{b.subtitle}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-white">{b.offerLabel}</p>
            <p className="text-4xl font-extrabold leading-none" style={{ color: b.accentColor }}>
              {b.offerValue}
            </p>
            <p className="text-sm font-bold text-white">{b.offerSuffix}</p>
            <span
              className="mt-2 rounded-full px-4 py-1.5 text-[11px] font-extrabold text-slate-900"
              style={{ backgroundColor: b.accentColor }}
            >
              {b.btnText}
            </span>
          </div>
        </div>
        <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
          Preview
        </span>
      </div>

      <Toggle
        label="Show this banner on the homepage"
        checked={b.enabled}
        onChange={(enabled) => set({ enabled })}
      />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <ImageInput
          label="Background image"
          value={b.image}
          onChange={(image) => set({ image })}
          aspect="aspect-[5/2]"
        />
        <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput
            label="Heading line 1"
            value={b.headingLine1}
            onChange={(headingLine1) => set({ headingLine1 })}
          />
          <TextInput
            label="Heading line 2 (highlighted)"
            value={b.headingLine2}
            onChange={(headingLine2) => set({ headingLine2 })}
          />
          <TextInput
            label="Subtitle"
            value={b.subtitle}
            onChange={(subtitle) => set({ subtitle })}
          />
          <TextInput
            label="Offer label"
            value={b.offerLabel}
            onChange={(offerLabel) => set({ offerLabel })}
            placeholder="FLAT"
          />
          <TextInput
            label="Offer value"
            value={b.offerValue}
            onChange={(offerValue) => set({ offerValue })}
            placeholder="20%"
          />
          <TextInput
            label="Offer suffix"
            value={b.offerSuffix}
            onChange={(offerSuffix) => set({ offerSuffix })}
            placeholder="OFF"
          />
          <TextInput
            label="Button text"
            value={b.btnText}
            onChange={(btnText) => set({ btnText })}
          />
          <TextInput label="Link" value={b.link} onChange={(link) => set({ link })} />
          <div />
          <ColorInput
            label="Background colour"
            value={b.bgColor}
            onChange={(bgColor) => set({ bgColor })}
          />
          <ColorInput
            label="Highlight colour"
            value={b.accentColor}
            onChange={(accentColor) => set({ accentColor })}
          />
        </div>
      </div>
    </div>
  );
}

function TestimonialsEditor({
  value,
  onChange,
}: {
  value: TestimonialsSection;
  onChange: (v: TestimonialsSection) => void;
}) {
  return (
    <div className="space-y-5">
      <TextInput
        label="Section title"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
        className="max-w-md"
      />
      <ListEditor
        title="Testimonials"
        description="Portrait thumbnails (3:4, e.g. 512×683). Add a YouTube or .mp4 link to show a play button that opens the video."
        items={value.items}
        onChange={(items) => onChange({ ...value, items })}
        addLabel="Add testimonial"
        createItem={(): Testimonial => ({ id: newId("t"), name: "", image: "" })}
        layout="grid"
        renderItem={(t, set) => (
          <div className="space-y-3">
            <ImageInput
              label="Thumbnail"
              value={t.image}
              onChange={(image) => set({ ...t, image })}
              aspect="aspect-[3/4]"
            />
            <TextInput
              label="Customer name"
              value={t.name}
              onChange={(name) => set({ ...t, name })}
            />
            <TextInput
              label="Video link (optional)"
              value={t.videoUrl || ""}
              onChange={(videoUrl) => set({ ...t, videoUrl: videoUrl || undefined })}
              placeholder="https://youtube.com/shorts/…"
            />
          </div>
        )}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ListEditor<T extends { id: string }>({
  title,
  description,
  items,
  onChange,
  createItem,
  renderItem,
  addLabel,
  layout = "list",
}: {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, set: (next: T) => void) => ReactNode;
  addLabel: string;
  layout?: "list" | "grid";
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionIntro title={title} description={description} />
        <button
          type="button"
          disabled={items.length >= 12}
          onClick={() => onChange([...items, createItem()])}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
          Nothing here yet — click “{addLabel}”.
        </p>
      )}

      <div
        className={
          layout === "grid"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-4"
        }
      >
        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                #{i + 1}
              </span>
              <div className="flex items-center gap-1">
                <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Remove"
                  danger
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            {renderItem(item, (next) => onChange(items.map((x, idx) => (idx === i ? next : x))))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-mono uppercase`}
        />
      </span>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
      {label}
    </label>
  );
}

function ImageInput({
  label,
  value,
  onChange,
  aspect,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await uploadProductImageFn({
        data: { filename: file.name, base64Data, contentType: file.type },
      });
      if (res.success && res.url) onChange(res.url);
      else setError(("error" in res && res.error) || "Upload failed");
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={`group relative flex w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white ${aspect} cursor-pointer hover:border-orange-400`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 p-3 text-center text-xs text-slate-400">
            <UploadCloud className="h-6 w-6" />
            Click or drop an image
          </span>
        )}
        {value && !uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
            Replace image
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      <input
        type="text"
        value={value.startsWith("data:") ? "(uploaded image)" : value}
        readOnly={value.startsWith("data:")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image URL"
        className={`${inputCls} mt-2 text-xs`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
