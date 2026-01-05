"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/marketplace/ListingForm";

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Listing</h1>
          <p className="text-slate-400">
            List your item for sale. Choose between auction or fixed price.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 md:p-8">
          <ListingForm mode="create" />
        </div>
      </div>
    </div>
  );
}

