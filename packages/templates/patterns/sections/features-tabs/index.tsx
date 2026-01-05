/**
 * Features Tabs Section
 * 
 * Tabbed interface showing one feature at a time.
 */

"use client";

import { useState } from "react";
import Image from "next/image";

interface Feature {
  tabTitle: string;
  content: string;
  image?: string;
}

export interface FeaturesTabsProps {
  headline?: string;
  subtext?: string;
  features: Feature[];
  variant?: "light" | "dark";
}

export function FeaturesTabs({
  headline,
  subtext,
  features,
  variant = "light",
}: FeaturesTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {(headline || subtext) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {headline && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
                {headline}
              </h2>
            )}
            {subtext && (
              <p className={`text-xl ${subtextClass}`}>
                {subtext}
              </p>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === index
                    ? "bg-primary text-white"
                    : variant === "dark"
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {feature.tabTitle}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {features[activeTab].image && (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg order-2 lg:order-1">
                <Image
                  src={features[activeTab].image}
                  alt={features[activeTab].tabTitle}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className={`order-1 lg:order-2 ${!features[activeTab].image ? "lg:col-span-2 text-center" : ""}`}>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${textClass}`}>
                {features[activeTab].tabTitle}
              </h3>
              <p className={`text-lg leading-relaxed ${subtextClass}`}>
                {features[activeTab].content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesTabs;

