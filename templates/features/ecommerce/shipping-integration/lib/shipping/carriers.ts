/**
 * Shipping Carriers
 * 
 * Integration with shipping carriers for rates and tracking.
 */

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  estimatedDays: number;
  price: number;
  currency: string;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
}

export type TrackingStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "returned";

/**
 * Get shipping rates from carrier APIs
 * Note: In production, integrate with Shippo, EasyPost, or carrier APIs directly
 */
export async function getShippingRates(
  origin: Address,
  destination: Address,
  packages: Package[]
): Promise<ShippingRate[]> {
  // Placeholder - integrate with real shipping API
  const mockRates: ShippingRate[] = [
    {
      id: "usps_priority",
      carrier: "USPS",
      service: "Priority Mail",
      estimatedDays: 3,
      price: 8.99,
      currency: "USD",
    },
    {
      id: "usps_ground",
      carrier: "USPS",
      service: "Ground Advantage",
      estimatedDays: 5,
      price: 5.99,
      currency: "USD",
    },
    {
      id: "ups_ground",
      carrier: "UPS",
      service: "Ground",
      estimatedDays: 5,
      price: 7.49,
      currency: "USD",
    },
    {
      id: "ups_2day",
      carrier: "UPS",
      service: "2nd Day Air",
      estimatedDays: 2,
      price: 15.99,
      currency: "USD",
    },
    {
      id: "fedex_express",
      carrier: "FedEx",
      service: "Express Saver",
      estimatedDays: 3,
      price: 12.99,
      currency: "USD",
    },
    {
      id: "fedex_overnight",
      carrier: "FedEx",
      service: "Overnight",
      estimatedDays: 1,
      price: 24.99,
      currency: "USD",
    },
  ];

  // Calculate based on package weight/dimensions
  const weightMultiplier = packages.reduce((sum, pkg) => sum + pkg.weight, 0) / 16;

  return mockRates.map((rate) => ({
    ...rate,
    price: Math.round((rate.price + rate.price * weightMultiplier) * 100) / 100,
  }));
}

/**
 * Get tracking information
 */
export async function getTrackingInfo(
  carrier: string,
  trackingNumber: string
): Promise<TrackingInfo | null> {
  // Placeholder - integrate with real tracking API
  return {
    carrier,
    trackingNumber,
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    events: [
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: "Memphis, TN",
        status: "In Transit",
        description: "Package departed facility",
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: "Los Angeles, CA",
        status: "Shipped",
        description: "Package picked up",
      },
    ],
  };
}

/**
 * Get carrier tracking URL
 */
export function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const urls: Record<string, (n: string) => string> = {
    usps: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
    ups: (n) => `https://www.ups.com/track?tracknum=${n}`,
    fedex: (n) => `https://www.fedex.com/fedextrack/?tracknumbers=${n}`,
    dhl: (n) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`,
  };

  const urlFn = urls[carrier.toLowerCase()];
  return urlFn ? urlFn(trackingNumber) : "";
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Package {
  weight: number; // oz
  length: number; // inches
  width: number;
  height: number;
}

