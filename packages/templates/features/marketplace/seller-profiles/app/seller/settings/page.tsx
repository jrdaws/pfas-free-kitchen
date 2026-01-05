"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, User } from "lucide-react";
import { getOrCreateSellerProfile, updateSellerProfile } from "@/lib/marketplace/seller-ratings";
import type { SellerProfile } from "@/lib/marketplace/seller-ratings";

export default function SellerSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getOrCreateSellerProfile();
        setProfile(data);
        setDisplayName(data.displayName);
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateSellerProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/my-listings"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          My Listings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seller Profile</h1>
          <p className="text-slate-400">
            Update your public seller profile information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Enter a URL to your profile image
                </p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your seller name"
              maxLength={50}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              This is how buyers will see you
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about yourself and what you sell..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Stats (Read Only) */}
          {profile && (
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{profile.totalSales}</p>
                  <p className="text-xs text-slate-400">Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {profile.ratingCount > 0 ? profile.ratingAvg.toFixed(1) : "-"}
                  </p>
                  <p className="text-xs text-slate-400">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.ratingCount}</p>
                  <p className="text-xs text-slate-400">Reviews</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              Profile saved successfully!
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Save Changes"
              )}
            </button>
            {profile && (
              <Link
                href={`/seller/${profile.userId}`}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                View Profile
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

