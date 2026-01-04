"use client";

import { TrackingInfo as TrackingInfoType, getTrackingUrl } from "@/lib/shipping/carriers";

interface TrackingInfoProps {
  tracking: TrackingInfoType;
  className?: string;
}

export function TrackingInfo({ tracking, className = "" }: TrackingInfoProps) {
  const trackingUrl = getTrackingUrl(tracking.carrier, tracking.trackingNumber);

  const getStatusColor = () => {
    switch (tracking.status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "exception":
      case "returned":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = () => {
    switch (tracking.status) {
      case "pending":
        return "Label Created";
      case "in_transit":
        return "In Transit";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "exception":
        return "Exception";
      case "returned":
        return "Returned";
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {tracking.carrier}
          </p>
          <p className="font-mono text-sm dark:text-gray-300">
            {tracking.trackingNumber}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
      </div>

      {tracking.estimatedDelivery && tracking.status !== "delivered" && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estimated Delivery
          </p>
          <p className="font-medium dark:text-white">
            {tracking.estimatedDelivery.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="space-y-4">
        <h3 className="font-medium dark:text-white">Tracking History</h3>
        <div className="relative">
          {tracking.events.map((event, index) => (
            <div key={index} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === 0 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                {index < tracking.events.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <p className="font-medium dark:text-white">{event.status}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {event.timestamp.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  • {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
        >
          Track on {tracking.carrier}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

