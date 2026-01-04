# Gap Analysis Report

Generated: 2026-01-04T06:05:14.851Z

Failed Tests: 8/12

---

## Missing Files

| Test | Expected | Found | Missing |
|------|----------|-------|---------|
| T21 | 6 | 0 | lib/sanity/client.ts, lib/sanity/queries.ts, lib/sanity/image.ts (+3 more) |
| T22 | 6 | 0 | sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts (+3 more) |
| T23 | 5 | 0 | lib/cloudinary.ts, lib/cloudinary-upload.ts, components/media/CloudinaryImage.tsx (+2 more) |
| T24 | 3 | 0 | lib/inngest/client.ts, lib/inngest/functions.ts, app/api/inngest/route.ts |
| T25 | 5 | 0 | lib/notifications/novu.ts, lib/notifications/novu-client.ts, components/notifications/NotificationBell.tsx (+2 more) |
| T26 | 3 | 0 | lib/feature-flags/posthog.ts, hooks/useFeatureFlag.ts, components/FeatureFlag.tsx |
| T27 | 5 | 0 | lib/search/algolia.ts, lib/search/indexer.ts, components/search/SearchBox.tsx (+2 more) |

## Build Failures

| Test | Error | Root Cause |
|------|-------|------------|

## Recommendations

### T05: SaaS + PostHog Analytics

- Fix: fetch failed

### T21: SaaS + Sanity CMS

- Add missing files: lib/sanity/client.ts, lib/sanity/queries.ts, lib/sanity/image.ts, sanity.config.ts, sanity/schemas/index.ts, app/studio/[[...tool]]/page.tsx
- Fix: Missing files: lib/sanity/client.ts, lib/sanity/queries.ts, lib/sanity/image.ts, sanity.config.ts, sanity/schemas/index.ts, app/studio/[[...tool]]/page.tsx
- Fix: Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET

### T22: SaaS + Sentry Monitoring

- Add missing files: sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, instrumentation.ts, app/global-error.tsx, lib/sentry.ts
- Fix: Missing files: sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, instrumentation.ts, app/global-error.tsx, lib/sentry.ts
- Fix: Missing env vars: SENTRY_DSN

### T23: SaaS + Cloudinary Images

- Add missing files: lib/cloudinary.ts, lib/cloudinary-upload.ts, components/media/CloudinaryImage.tsx, components/media/CloudinaryUpload.tsx, app/api/cloudinary/sign/route.ts
- Fix: Missing files: lib/cloudinary.ts, lib/cloudinary-upload.ts, components/media/CloudinaryImage.tsx, components/media/CloudinaryUpload.tsx, app/api/cloudinary/sign/route.ts
- Fix: Missing env vars: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

### T24: SaaS + Inngest Background Jobs

- Add missing files: lib/inngest/client.ts, lib/inngest/functions.ts, app/api/inngest/route.ts
- Fix: Missing files: lib/inngest/client.ts, lib/inngest/functions.ts, app/api/inngest/route.ts
- Fix: Missing env vars: INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY

### T25: SaaS + Novu Notifications

- Add missing files: lib/notifications/novu.ts, lib/notifications/novu-client.ts, components/notifications/NotificationBell.tsx, components/notifications/NotificationCenter.tsx, app/api/notifications/route.ts
- Fix: Missing files: lib/notifications/novu.ts, lib/notifications/novu-client.ts, components/notifications/NotificationBell.tsx, components/notifications/NotificationCenter.tsx, app/api/notifications/route.ts
- Fix: Missing env vars: NOVU_API_KEY, NEXT_PUBLIC_NOVU_APP_ID

### T26: SaaS + PostHog Feature Flags

- Add missing files: lib/feature-flags/posthog.ts, hooks/useFeatureFlag.ts, components/FeatureFlag.tsx
- Fix: Missing files: lib/feature-flags/posthog.ts, hooks/useFeatureFlag.ts, components/FeatureFlag.tsx
- Fix: Missing env vars: NEXT_PUBLIC_POSTHOG_KEY

### T27: SaaS + Algolia Search

- Add missing files: lib/search/algolia.ts, lib/search/indexer.ts, components/search/SearchBox.tsx, components/search/SearchModal.tsx, hooks/useSearch.ts
- Fix: Missing files: lib/search/algolia.ts, lib/search/indexer.ts, components/search/SearchBox.tsx, components/search/SearchModal.tsx, hooks/useSearch.ts
- Fix: Missing env vars: NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_KEY, ALGOLIA_ADMIN_KEY
