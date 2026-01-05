"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, MoreVertical, Eye, Edit, Trash2, Rocket } from "lucide-react";
import { getSellerListings, publishListing, cancelListing, deleteListing } from "@/lib/marketplace/listings";
import type { Listing, ListingStatus } from "@/lib/marketplace/listing-types";
import { STATUS_LABELS } from "@/lib/marketplace/listing-types";

const STATUS_COLORS: Record<ListingStatus, string> = {
  draft: "bg-slate-600",
  active: "bg-emerald-500",
  ended: "bg-yellow-500",
  sold: "bg-blue-500",
  cancelled: "bg-red-500",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "draft" | "ended">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // TODO: Get current user ID from auth
        const userId = "current-user-id";
        const data = await getSellerListings(userId);
        setListings(data);
      } catch (error) {
        console.error("Failed to load listings:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredListings = listings.filter((l) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return l.status === "active";
    if (activeTab === "draft") return l.status === "draft";
    if (activeTab === "ended") return l.status === "ended" || l.status === "sold";
    return true;
  });

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await publishListing(id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: updated.status } : l))
      );
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      await cancelListing(id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "cancelled" as ListingStatus } : l))
      );
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    
    setActionLoading(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const tabs = [
    { id: "all", label: "All", count: listings.length },
    { id: "active", label: "Active", count: listings.filter((l) => l.status === "active").length },
    { id: "draft", label: "Drafts", count: listings.filter((l) => l.status === "draft").length },
    { id: "ended", label: "Ended", count: listings.filter((l) => l.status === "ended" || l.status === "sold").length },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Listings</h1>
            <p className="text-slate-400">Manage your items for sale</p>
          </div>
          <Link
            href="/listings/create"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Listings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Bids</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-700" />
                        )}
                        <div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="text-white hover:text-orange-400 font-medium line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          <p className="text-xs text-slate-400">
                            {listing.listingType === "auction" ? "Auction" : "Fixed Price"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white hidden md:table-cell">
                      {formatPrice(listing.currentPrice || listing.startingPrice)}
                    </td>
                    <td className="px-4 py-4 text-slate-400 hidden sm:table-cell">
                      {listing.bidCount}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${
                          STATUS_COLORS[listing.status]
                        }`}
                      >
                        {STATUS_LABELS[listing.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                          disabled={actionLoading === listing.id}
                        >
                          {actionLoading === listing.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <MoreVertical className="w-5 h-5" />
                          )}
                        </button>

                        {openMenu === listing.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                            <Link
                              href={`/listings/${listing.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                              View Listing
                            </Link>
                            
                            {listing.status === "draft" && (
                              <>
                                <Link
                                  href={`/listings/${listing.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handlePublish(listing.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700"
                                >
                                  <Rocket className="w-4 h-4" />
                                  Publish
                                </button>
                                <button
                                  onClick={() => handleDelete(listing.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </>
                            )}
                            
                            {listing.status === "active" && (
                              <button
                                onClick={() => handleCancel(listing.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel Listing
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <p className="text-slate-400 text-lg mb-4">
              {activeTab === "all"
                ? "You haven't created any listings yet"
                : `No ${activeTab} listings`}
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

