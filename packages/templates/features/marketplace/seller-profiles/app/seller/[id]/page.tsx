"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Star, ShieldCheck, Calendar, Package } from "lucide-react";
import { getSellerProfile, getSellerRatings } from "@/lib/marketplace/seller-ratings";
import { getSellerListings } from "@/lib/marketplace/listings";
import { SellerReviews } from "@/components/marketplace/SellerReviews";
import { ListingCard } from "@/components/marketplace/ListingCard";
import type { SellerProfile } from "@/lib/marketplace/seller-ratings";
import type { Listing } from "@/lib/marketplace/listing-types";

type Tab = "listings" | "reviews" | "about";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sellerData, listingsData] = await Promise.all([
          getSellerProfile(sellerId),
          getSellerListings(sellerId, ["active"]),
        ]);
        setSeller(sellerData);
        setListings(listingsData);
      } catch (error) {
        console.error("Failed to load seller:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Seller Not Found</h1>
        <Link href="/listings" className="text-orange-500 hover:text-orange-400">
          ← Back to Listings
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "listings", label: "Listings", count: listings.length },
    { id: "reviews", label: "Reviews", count: seller.ratingCount },
    { id: "about", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        {/* Profile Header */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0">
              {seller.avatarUrl ? (
                <Image
                  src={seller.avatarUrl}
                  alt={seller.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-white font-bold text-4xl">
                  {seller.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{seller.displayName}</h1>
                {seller.verifiedSeller && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Seller
                  </span>
                )}
              </div>

              {seller.bio && (
                <p className="text-slate-400 mb-4 max-w-2xl">{seller.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= seller.ratingAvg
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-slate-600 text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">
                    {seller.ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-slate-400">({seller.ratingCount} reviews)</span>
                </div>

                {/* Sales */}
                <div className="flex items-center gap-2 text-slate-400">
                  <Package className="w-4 h-4" />
                  <span className="text-white font-medium">{seller.totalSales}</span> sales
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  Member since {formatDate(seller.memberSince)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "listings" && (
          <div>
            {listings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No active listings
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <SellerReviews sellerId={sellerId} />
        )}

        {activeTab === "about" && (
          <div className="max-w-2xl">
            <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">About {seller.displayName}</h3>
              
              <div className="space-y-4 text-sm">
                {seller.bio ? (
                  <p className="text-slate-300">{seller.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    This seller hasn&apos;t added a bio yet.
                  </p>
                )}

                <div className="pt-4 border-t border-slate-700 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member since</span>
                    <span className="text-white">{formatDate(seller.memberSince)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total sales</span>
                    <span className="text-white">{seller.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average rating</span>
                    <span className="text-white">
                      {seller.ratingCount > 0 ? (
                        <>★ {seller.ratingAvg.toFixed(1)} ({seller.ratingCount} reviews)</>
                      ) : (
                        "No ratings yet"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

