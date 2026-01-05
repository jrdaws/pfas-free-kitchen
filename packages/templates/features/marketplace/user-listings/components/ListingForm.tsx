"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import type { CreateListingInput, ListingCategory, ItemCondition, ListingType } from "../lib/listing-types";
import { CONDITION_LABELS, LISTING_TYPE_LABELS } from "../lib/listing-types";
import { createListing, updateListing, publishListing, getCategories } from "../lib/listings";

interface ListingFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateListingInput>;
  listingId?: string;
  onSuccess?: () => void;
}

export function ListingForm({ mode, initialData, listingId, onSuccess }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  
  const [formData, setFormData] = useState<CreateListingInput>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
    categoryId: initialData?.categoryId,
    condition: initialData?.condition || "good",
    startingPrice: initialData?.startingPrice || 0.99,
    buyItNowPrice: initialData?.buyItNowPrice,
    reservePrice: initialData?.reservePrice,
    listingType: initialData?.listingType || "auction",
    durationDays: initialData?.durationDays || 7,
    autoExtend: initialData?.autoExtend ?? true,
    shippingCost: initialData?.shippingCost || 0,
    shipsFrom: initialData?.shipsFrom || "",
    shipsTo: initialData?.shipsTo || ["US"],
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const updateField = <K extends keyof CreateListingInput>(
    field: K,
    value: CreateListingInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload to storage and get URLs
    // For now, create object URLs
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    updateField("images", [...(formData.images || []), ...newImages].slice(0, 12));
  };

  const removeImage = (index: number) => {
    updateField("images", (formData.images || []).filter((_, i) => i !== index));
  };

  const handleSubmit = async (publish: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      let listing;
      
      if (mode === "create") {
        listing = await createListing(formData);
      } else if (listingId) {
        listing = await updateListing(listingId, formData);
      }

      if (listing && publish) {
        await publishListing(listing.id);
      }

      onSuccess?.();
      router.push(publish ? `/listings/${listing?.id}` : "/my-listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 3;
      case 2:
        return (formData.images || []).length >= 1;
      case 3:
        return formData.startingPrice > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {["Details", "Photos", "Pricing", "Shipping"].map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 < step
                  ? "bg-emerald-500 text-white"
                  : i + 1 === step
                  ? "bg-orange-500 text-white"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                i + 1 <= step ? "text-white" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < 3 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  i + 1 < step ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="What are you selling?"
              maxLength={80}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-slate-400">{formData.title.length}/80</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId || ""}
              onChange={(e) => updateField("categoryId", e.target.value || undefined)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CONDITION_LABELS) as ItemCondition[]).map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => updateField("condition", condition)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    formData.condition === condition
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {CONDITION_LABELS[condition]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your item in detail..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Photos */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Photos * (up to 12)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {(formData.images || []).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
              
              {(formData.images || []).length < 12 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="mt-2 text-xs text-slate-400">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              First photo will be the main image. Drag to reorder.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Listing Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("listingType", type)}
                  className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                    formData.listingType === type
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {LISTING_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Starting Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.startingPrice}
                onChange={(e) => updateField("startingPrice", Number(e.target.value))}
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {(formData.listingType === "both" || formData.listingType === "fixed") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Buy It Now Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={formData.buyItNowPrice || ""}
                  onChange={(e) => updateField("buyItNowPrice", e.target.value ? Number(e.target.value) : undefined)}
                  min={formData.startingPrice + 1}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {formData.listingType !== "fixed" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reserve Price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={formData.reservePrice || ""}
                    onChange={(e) => updateField("reservePrice", e.target.value ? Number(e.target.value) : undefined)}
                    min={formData.startingPrice}
                    step="0.01"
                    placeholder="Minimum acceptable price"
                    className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Hidden from buyers. Auction won&apos;t complete if not met.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration
                </label>
                <select
                  value={formData.durationDays}
                  onChange={(e) => updateField("durationDays", Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                  <option value={10}>10 days</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoExtend"
                  checked={formData.autoExtend}
                  onChange={(e) => updateField("autoExtend", e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="autoExtend" className="text-sm text-slate-300">
                  Auto-extend auction if bid placed in last 2 minutes
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 4: Shipping */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Shipping Cost
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => updateField("shippingCost", Number(e.target.value))}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Set to 0 for free shipping</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ships From
            </label>
            <input
              type="text"
              value={formData.shipsFrom}
              onChange={(e) => updateField("shipsFrom", e.target.value)}
              placeholder="City, State"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ships To
            </label>
            <div className="flex flex-wrap gap-2">
              {["US", "Canada", "Worldwide"].map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => {
                    const current = formData.shipsTo || [];
                    const updated = current.includes(region)
                      ? current.filter((r) => r !== region)
                      : [...current, region];
                    updateField("shipsTo", updated);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    (formData.shipsTo || []).includes(region)
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        <div className="flex gap-3">
          {step === totalSteps ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Listing"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingForm;

