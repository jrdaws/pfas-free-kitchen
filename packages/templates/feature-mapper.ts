/**
 * Feature Mapper
 * 
 * Maps detected website analysis features to code templates.
 * When a user analyzes an inspiration site, the detected features
 * are mapped to specific component files for export.
 */

export interface FeatureTemplate {
  files: string[];
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  envVars: string[];
}

/**
 * Maps analysis feature paths to template configurations.
 * Feature paths follow the WebsiteAnalysis.features structure.
 */
export const FEATURE_TEMPLATES: Record<string, FeatureTemplate> = {
  // ===========================================
  // AUTH FEATURES
  // ===========================================
  'auth.hasLogin': {
    files: [
      'app/login/page.tsx',
      'components/auth/LoginForm.tsx',
      'hooks/useAuth.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'auth.hasSignup': {
    files: [
      'app/signup/page.tsx',
      'components/auth/SignupForm.tsx',
      'lib/auth/validation.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'auth.hasSocialAuth.google': {
    files: [
      'app/api/auth/google/route.ts',
      'components/auth/SocialAuthButtons.tsx',
    ],
    dependencies: {},
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  'auth.hasSocialAuth.github': {
    files: [
      'app/api/auth/github/route.ts',
      'components/auth/SocialAuthButtons.tsx',
    ],
    dependencies: {},
    envVars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  },
  'auth.hasSocialAuth.apple': {
    files: [
      'app/api/auth/apple/route.ts',
      'components/auth/SocialAuthButtons.tsx',
    ],
    dependencies: {},
    envVars: ['APPLE_CLIENT_ID', 'APPLE_CLIENT_SECRET'],
  },
  'auth.hasPasswordReset': {
    files: [
      'app/forgot-password/page.tsx',
      'app/reset-password/page.tsx',
      'components/auth/ForgotPasswordForm.tsx',
      'components/auth/ResetPasswordForm.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'auth.hasMfa': {
    files: [
      'app/settings/security/page.tsx',
      'components/auth/MfaSetup.tsx',
      'components/auth/MfaVerify.tsx',
    ],
    dependencies: { 'otpauth': '^9.2.0' },
    envVars: [],
  },

  // ===========================================
  // ECOMMERCE FEATURES
  // ===========================================
  'ecommerce.hasProducts': {
    files: [
      'components/products/ProductCard.tsx',
      'components/products/ProductGrid.tsx',
      'components/products/ProductFilters.tsx',
      'components/products/ProductQuickView.tsx',
      'lib/products/types.ts',
      'app/products/page.tsx',
      'app/products/[slug]/page.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'ecommerce.hasCart': {
    files: [
      'components/cart/CartDrawer.tsx',
      'components/cart/CartItem.tsx',
      'components/cart/CartSummary.tsx',
      'components/cart/AddToCartButton.tsx',
      'lib/cart/cart-store.ts',
      'lib/cart/cart-utils.ts',
      'hooks/useCart.ts',
    ],
    dependencies: { 'zustand': '^4.5.0' },
    envVars: [],
  },
  'ecommerce.hasCheckout': {
    files: [
      'app/checkout/page.tsx',
      'app/checkout/success/page.tsx',
      'app/checkout/cancel/page.tsx',
      'components/checkout/CheckoutForm.tsx',
      'components/checkout/CheckoutSummary.tsx',
      'components/checkout/ShippingForm.tsx',
      'components/checkout/PaymentForm.tsx',
      'hooks/useCheckout.ts',
      'lib/checkout/checkout-context.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'ecommerce.hasWishlist': {
    files: [
      'app/wishlist/page.tsx',
      'components/wishlist/WishlistButton.tsx',
      'components/wishlist/WishlistGrid.tsx',
      'lib/wishlist/wishlist-store.ts',
      'hooks/useWishlist.ts',
    ],
    dependencies: { 'zustand': '^4.5.0' },
    envVars: [],
  },
  'ecommerce.hasReviews': {
    files: [
      'components/reviews/ReviewList.tsx',
      'components/reviews/ReviewForm.tsx',
      'components/reviews/StarRating.tsx',
      'components/reviews/ReviewStats.tsx',
      'app/api/reviews/route.ts',
      'hooks/useReviews.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'ecommerce.hasInventory': {
    files: [
      'components/products/StockIndicator.tsx',
      'components/products/LowStockAlert.tsx',
      'lib/inventory/inventory-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'ecommerce.hasPricing': {
    files: [
      'components/pricing/PriceDisplay.tsx',
      'components/pricing/SaleTag.tsx',
      'lib/pricing/price-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // SOCIAL FEATURES
  // ===========================================
  'social.hasProfiles': {
    files: [
      'app/profile/[username]/page.tsx',
      'app/settings/profile/page.tsx',
      'components/profile/ProfileCard.tsx',
      'components/profile/ProfileHeader.tsx',
      'components/profile/ProfileStats.tsx',
      'components/profile/AvatarUpload.tsx',
      'lib/profiles/types.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasComments': {
    files: [
      'components/comments/CommentSection.tsx',
      'components/comments/CommentItem.tsx',
      'components/comments/CommentForm.tsx',
      'components/comments/CommentReplies.tsx',
      'app/api/comments/route.ts',
      'app/api/comments/[id]/route.ts',
      'hooks/useComments.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasLikes': {
    files: [
      'components/social/LikeButton.tsx',
      'components/social/LikeCount.tsx',
      'hooks/useLikes.ts',
      'app/api/likes/route.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasFollowing': {
    files: [
      'components/social/FollowButton.tsx',
      'components/social/FollowersList.tsx',
      'components/social/FollowingList.tsx',
      'app/api/follow/route.ts',
      'hooks/useFollow.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasSharing': {
    files: [
      'components/social/ShareButtons.tsx',
      'components/social/ShareModal.tsx',
      'lib/social/share-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasFeed': {
    files: [
      'app/feed/page.tsx',
      'components/feed/FeedItem.tsx',
      'components/feed/FeedList.tsx',
      'components/feed/CreatePost.tsx',
      'hooks/useFeed.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'social.hasMessaging': {
    files: [
      'app/messages/page.tsx',
      'app/messages/[conversationId]/page.tsx',
      'components/messaging/ConversationList.tsx',
      'components/messaging/MessageThread.tsx',
      'components/messaging/MessageInput.tsx',
      'hooks/useMessages.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // CONTENT FEATURES
  // ===========================================
  'content.hasBlog': {
    files: [
      'app/blog/page.tsx',
      'app/blog/[slug]/page.tsx',
      'components/blog/BlogCard.tsx',
      'components/blog/BlogList.tsx',
      'components/blog/BlogHeader.tsx',
      'components/blog/TableOfContents.tsx',
      'lib/blog/types.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'content.hasSearch': {
    files: [
      'components/search/SearchBox.tsx',
      'components/search/SearchResults.tsx',
      'components/search/SearchFilters.tsx',
      'app/search/page.tsx',
      'hooks/useSearch.ts',
      'lib/search/search-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'content.hasFaq': {
    files: [
      'app/faq/page.tsx',
      'components/faq/FaqItem.tsx',
      'components/faq/FaqList.tsx',
      'components/faq/FaqSearch.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'content.hasDocs': {
    files: [
      'app/docs/page.tsx',
      'app/docs/[...slug]/page.tsx',
      'components/docs/DocsSidebar.tsx',
      'components/docs/DocsNavigation.tsx',
      'components/docs/CodeBlock.tsx',
    ],
    dependencies: { 'prism-react-renderer': '^2.3.0' },
    envVars: [],
  },
  'content.hasGallery': {
    files: [
      'app/gallery/page.tsx',
      'components/gallery/GalleryGrid.tsx',
      'components/gallery/GalleryLightbox.tsx',
      'components/gallery/GalleryUpload.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'content.hasMedia': {
    files: [
      'components/media/ImageUpload.tsx',
      'components/media/VideoPlayer.tsx',
      'components/media/MediaGallery.tsx',
      'lib/media/upload-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // COMMUNICATION FEATURES
  // ===========================================
  'communication.hasContactForm': {
    files: [
      'app/contact/page.tsx',
      'components/forms/ContactForm.tsx',
      'app/api/contact/route.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'communication.hasNewsletter': {
    files: [
      'components/newsletter/NewsletterForm.tsx',
      'components/newsletter/NewsletterPopup.tsx',
      'app/api/newsletter/subscribe/route.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'communication.hasChat': {
    files: [
      'components/chat/ChatWidget.tsx',
      'components/chat/ChatMessage.tsx',
      'components/chat/ChatInput.tsx',
      'hooks/useChat.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'communication.hasNotifications': {
    files: [
      'components/notifications/NotificationBell.tsx',
      'components/notifications/NotificationList.tsx',
      'components/notifications/NotificationItem.tsx',
      'hooks/useNotifications.ts',
      'lib/notifications/notification-types.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // BOOKING/SCHEDULING FEATURES
  // ===========================================
  'booking.hasAppointments': {
    files: [
      'app/book/page.tsx',
      'app/book/[service]/page.tsx',
      'components/booking/DateTimePicker.tsx',
      'components/booking/ServiceSelector.tsx',
      'components/booking/BookingConfirmation.tsx',
      'lib/booking/booking-types.ts',
      'hooks/useBooking.ts',
    ],
    dependencies: { 'date-fns': '^3.0.0' },
    envVars: [],
  },
  'booking.hasCalendar': {
    files: [
      'components/calendar/CalendarView.tsx',
      'components/calendar/EventCard.tsx',
      'components/calendar/CalendarNavigation.tsx',
      'lib/calendar/calendar-utils.ts',
    ],
    dependencies: { 'date-fns': '^3.0.0' },
    envVars: [],
  },
  'booking.hasReservations': {
    files: [
      'app/reservations/page.tsx',
      'components/reservations/ReservationForm.tsx',
      'components/reservations/GuestSelector.tsx',
      'components/reservations/AvailabilityDisplay.tsx',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // SUBSCRIPTION/BILLING FEATURES
  // ===========================================
  'subscription.hasPricing': {
    files: [
      'app/pricing/page.tsx',
      'components/pricing/PricingTable.tsx',
      'components/pricing/PricingCard.tsx',
      'components/pricing/PricingToggle.tsx',
      'components/pricing/FeatureList.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'subscription.hasBilling': {
    files: [
      'app/settings/billing/page.tsx',
      'components/billing/BillingHistory.tsx',
      'components/billing/PaymentMethods.tsx',
      'components/billing/SubscriptionCard.tsx',
      'components/billing/UsageStats.tsx',
      'hooks/useBilling.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'subscription.hasTrials': {
    files: [
      'components/billing/TrialBanner.tsx',
      'components/billing/TrialCountdown.tsx',
      'lib/billing/trial-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // DASHBOARD/ANALYTICS FEATURES
  // ===========================================
  'dashboard.hasAnalytics': {
    files: [
      'app/(dashboard)/analytics/page.tsx',
      'components/analytics/AnalyticsChart.tsx',
      'components/analytics/MetricsCard.tsx',
      'components/analytics/DateRangePicker.tsx',
      'hooks/useAnalytics.ts',
    ],
    dependencies: { 'recharts': '^2.10.0', 'date-fns': '^3.0.0' },
    envVars: [],
  },
  'dashboard.hasReports': {
    files: [
      'app/(dashboard)/reports/page.tsx',
      'components/reports/ReportBuilder.tsx',
      'components/reports/ReportTable.tsx',
      'components/reports/ExportButton.tsx',
    ],
    dependencies: { 'recharts': '^2.10.0' },
    envVars: [],
  },
  'dashboard.hasStats': {
    files: [
      'components/dashboard/StatsGrid.tsx',
      'components/dashboard/StatCard.tsx',
      'components/dashboard/TrendIndicator.tsx',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // ADMIN/ENTERPRISE FEATURES
  // ===========================================
  'admin.hasUserManagement': {
    files: [
      'app/(admin)/users/page.tsx',
      'app/(admin)/users/[id]/page.tsx',
      'components/admin/UserTable.tsx',
      'components/admin/UserForm.tsx',
      'components/admin/RoleSelector.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'admin.hasContentModeration': {
    files: [
      'app/(admin)/moderation/page.tsx',
      'components/admin/ModerationQueue.tsx',
      'components/admin/ModerationActions.tsx',
      'lib/admin/moderation-utils.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'admin.hasSettings': {
    files: [
      'app/(admin)/settings/page.tsx',
      'components/admin/SettingsForm.tsx',
      'components/admin/FeatureToggles.tsx',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // LOCATION/MAP FEATURES
  // ===========================================
  'location.hasMap': {
    files: [
      'components/map/MapView.tsx',
      'components/map/MapMarker.tsx',
      'components/map/MapControls.tsx',
      'hooks/useMap.ts',
    ],
    dependencies: { 'mapbox-gl': '^3.0.0', '@types/mapbox-gl': '^2.7.0' },
    devDependencies: { '@types/mapbox-gl': '^2.7.0' },
    envVars: ['NEXT_PUBLIC_MAPBOX_TOKEN'],
  },
  'location.hasStoreLocator': {
    files: [
      'app/locations/page.tsx',
      'components/locations/LocationCard.tsx',
      'components/locations/LocationSearch.tsx',
      'components/locations/LocationMap.tsx',
    ],
    dependencies: {},
    envVars: [],
  },
  'location.hasGeoSearch': {
    files: [
      'components/search/NearbySearch.tsx',
      'components/search/DistanceFilter.tsx',
      'hooks/useGeolocation.ts',
    ],
    dependencies: {},
    envVars: [],
  },

  // ===========================================
  // INTEGRATION FEATURES
  // ===========================================
  'integrations.hasPayments': {
    files: [
      'lib/payments/stripe-client.ts',
      'app/api/payments/create-intent/route.ts',
      'app/api/payments/webhook/route.ts',
    ],
    dependencies: { 'stripe': '^14.0.0', '@stripe/stripe-js': '^2.0.0' },
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
  },
  'integrations.hasOAuth': {
    files: [
      'lib/auth/oauth-providers.ts',
      'app/api/auth/callback/route.ts',
    ],
    dependencies: {},
    envVars: [],
  },
  'integrations.hasWebhooks': {
    files: [
      'app/api/webhooks/[provider]/route.ts',
      'lib/webhooks/webhook-handler.ts',
      'lib/webhooks/webhook-types.ts',
    ],
    dependencies: {},
    envVars: [],
  },
};

/**
 * Get all template files for detected features
 */
export function getDetectedFeatureFiles(
  detectedFeatures: Record<string, unknown>
): {
  files: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVars: string[];
} {
  const files: string[] = [];
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const envVars: string[] = [];

  // Flatten nested features object into dot-notation paths
  const featurePaths = flattenFeatures(detectedFeatures);

  // Match each enabled feature to templates
  for (const [path, value] of Object.entries(featurePaths)) {
    // Only process truthy values
    if (!value) continue;

    const template = FEATURE_TEMPLATES[path];
    if (template) {
      files.push(...template.files);
      Object.assign(dependencies, template.dependencies);
      if (template.devDependencies) {
        Object.assign(devDependencies, template.devDependencies);
      }
      envVars.push(...template.envVars);
    }
  }

  // Deduplicate
  return {
    files: [...new Set(files)],
    dependencies,
    devDependencies,
    envVars: [...new Set(envVars)],
  };
}

/**
 * Flatten nested object into dot-notation paths
 * { auth: { hasLogin: true } } => { 'auth.hasLogin': true }
 */
function flattenFeatures(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects
      Object.assign(result, flattenFeatures(value as Record<string, unknown>, path));
    } else {
      result[path] = value;
    }
  }

  return result;
}

/**
 * Get feature summary for UI display
 */
export function getFeatureTemplateSummary(
  detectedFeatures: Record<string, unknown>
): {
  totalFiles: number;
  byCategory: Record<string, number>;
  dependencies: string[];
  envVarsRequired: string[];
} {
  const result = getDetectedFeatureFiles(detectedFeatures);
  const byCategory: Record<string, number> = {};

  // Categorize files by their directory
  for (const file of result.files) {
    const category = file.split('/')[0] || 'other';
    byCategory[category] = (byCategory[category] || 0) + 1;
  }

  return {
    totalFiles: result.files.length,
    byCategory,
    dependencies: Object.keys(result.dependencies),
    envVarsRequired: result.envVars,
  };
}

