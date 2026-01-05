"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { createRating } from "../lib/seller-ratings";

interface RatingFormProps {
  sellerId: string;
  listingId: string;
  transactionId?: string;
  onSuccess?: () => void;
}

export function RatingForm({
  sellerId,
  listingId,
  transactionId,
  onSuccess,
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [itemAsDescribed, setItemAsDescribed] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [shippingSpeed, setShippingSpeed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createRating({
        sellerId,
        listingId,
        transactionId,
        rating,
        review: review.trim() || undefined,
        itemAsDescribed: itemAsDescribed > 0 ? itemAsDescribed : undefined,
        communication: communication > 0 ? communication : undefined,
        shippingSpeed: shippingSpeed > 0 ? shippingSpeed : undefined,
      });

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
        <p className="text-emerald-400 font-semibold mb-2">Thank you for your feedback!</p>
        <p className="text-slate-400 text-sm">Your review has been submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Overall Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-slate-600 text-slate-600"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-slate-400 text-sm ml-2">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Write a Review (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this seller..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
        />
      </div>

      {/* Detailed Ratings */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-300">
          Detailed Ratings (optional)
        </p>

        <AspectRating
          label="Item as Described"
          value={itemAsDescribed}
          onChange={setItemAsDescribed}
        />
        <AspectRating
          label="Communication"
          value={communication}
          onChange={setCommunication}
        />
        <AspectRating
          label="Shipping Speed"
          value={shippingSpeed}
          onChange={setShippingSpeed}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}

function AspectRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hover || value)
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-slate-600 text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default RatingForm;

