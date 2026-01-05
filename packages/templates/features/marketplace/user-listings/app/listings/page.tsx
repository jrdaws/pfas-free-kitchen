"use client";

import { useState, useEffect, useCallback } from "react";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingFiltersBar } from "@/components/marketplace/ListingFilters";
import { getListings, addToWatchlist, removeFromWatchlist } from "@/lib/marketplace/listings";
import type { Listing, ListingFilters, ListingsResult } from "@/lib/marketplace/listing-types";
import { Loader2 } from "lucide-react";

export default function ListingsPage() {
  const [result, setResult] = useState<ListingsResult | null>(null);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListings(filters, page);
      setResult(data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFiltersChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handleWatch = async (listingId: string) => {
    const isWatched = watchedIds.has(listingId);
    try {
      if (isWatched) {
        await removeFromWatchlist(listingId);
        setWatchedIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await addToWatchlist(listingId);
        setWatchedIds((prev) => new Set(prev).add(listingId));
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Listings</h1>
          <p className="text-slate-400">
            Find great deals on items from sellers around the world
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ListingFiltersBar filters={filters} onChange={handleFiltersChange} />
        </div>

        {/* Results Count */}
        {result && !loading && (
          <div className="mb-4 text-sm text-slate-400">
            Showing {result.listings.length} of {result.total} listings
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : result && result.listings.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {result.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onWatch={handleWatch}
                  isWatched={watchedIds.has(listing.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {result.total > result.pageSize && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-400">
                  Page {page} of {Math.ceil(result.total / result.pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!result.hasMore}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg mb-4">No listings found</p>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

