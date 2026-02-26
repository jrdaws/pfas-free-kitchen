import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'verification', title: 'PFAS Verification' },
    { name: 'details', title: 'Product Details' },
    { name: 'affiliate', title: 'Affiliate Links' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required().min(3).max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'basic',
      rows: 3,
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      group: 'basic',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'isPrimary', type: 'boolean', title: 'Primary Image' },
          ],
        },
      ],
    }),
    defineField({
      name: 'verificationTier',
      title: 'Verification Tier',
      type: 'number',
      group: 'verification',
      options: {
        list: [
          { title: '0 - Unknown', value: 0 },
          { title: '1 - Brand Statement', value: 1 },
          { title: '2 - Policy Reviewed', value: 2 },
          { title: '3 - Lab Tested', value: 3 },
          { title: '4 - Monitored', value: 4 },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'claimType',
      title: 'Claim Type',
      type: 'string',
      group: 'verification',
      options: {
        list: [
          { title: 'Intentionally PFAS-Free', value: 'intentionally_pfas_free' },
          { title: 'Inherently PFAS-Free', value: 'inherently_pfas_free' },
          { title: 'PFAS-Free (Unknown Method)', value: 'pfas_free_unknown_method' },
        ],
      },
    }),
    defineField({
      name: 'verificationRationale',
      title: 'Verification Rationale',
      type: 'text',
      group: 'verification',
      rows: 2,
      description: 'Why this product received this verification tier',
    }),
    defineField({
      name: 'evidenceCount',
      title: 'Evidence Count',
      type: 'number',
      group: 'verification',
      initialValue: 0,
    }),
    defineField({
      name: 'decisionDate',
      title: 'Decision Date',
      type: 'date',
      group: 'verification',
    }),
    defineField({
      name: 'materialSummary',
      title: 'Material Summary',
      type: 'string',
      group: 'details',
      description: 'e.g., "Cast iron body, stainless steel handle"',
    }),
    defineField({
      name: 'coatingSummary',
      title: 'Coating Summary',
      type: 'string',
      group: 'details',
      description: 'e.g., "Thermolon ceramic non-stick"',
    }),
    defineField({
      name: 'components',
      title: 'Product Components',
      type: 'array',
      group: 'details',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'role',
              type: 'string',
              options: {
                list: [
                  'cooking_surface',
                  'body',
                  'lid',
                  'handle',
                  'rim',
                  'coating',
                  'other',
                ],
              },
            },
            { name: 'roleLabel', type: 'string' },
            { name: 'material', type: 'string' },
            {
              name: 'pfasStatus',
              type: 'string',
              options: {
                list: ['verified_free', 'claimed_free', 'unknown', 'contains_pfas'],
              },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'object',
      group: 'details',
      fields: [
        { name: 'inductionCompatible', type: 'boolean', title: 'Induction Compatible' },
        { name: 'ovenSafeTempF', type: 'number', title: 'Oven Safe Temp (°F)' },
        { name: 'dishwasherSafe', type: 'boolean', title: 'Dishwasher Safe' },
        { name: 'weight', type: 'string', title: 'Weight' },
        { name: 'dimensions', type: 'string', title: 'Dimensions' },
      ],
    }),
    defineField({
      name: 'amazonAsin',
      title: 'Amazon ASIN',
      type: 'string',
      group: 'affiliate',
      description: '10-character Amazon product identifier (e.g., B00006JSUA)',
      validation: (Rule) => Rule.regex(/^[A-Z0-9]{10}$/, { name: 'ASIN format' }),
    }),
    defineField({
      name: 'amazonPrice',
      title: 'Amazon Price (USD)',
      type: 'number',
      group: 'affiliate',
    }),
    defineField({
      name: 'amazonInStock',
      title: 'In Stock on Amazon',
      type: 'boolean',
      group: 'affiliate',
      initialValue: true,
    }),
    defineField({
      name: 'otherRetailers',
      title: 'Other Retailers',
      type: 'array',
      group: 'affiliate',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'retailerName', type: 'string', title: 'Retailer Name' },
            { name: 'url', type: 'url', title: 'Product URL' },
            { name: 'price', type: 'number', title: 'Price' },
            { name: 'inStock', type: 'boolean', title: 'In Stock' },
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Ready for Review', value: 'review' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand.name',
      media: 'images.0',
      tier: 'verificationTier',
    },
    prepare({ title, subtitle, media, tier }) {
      const tierLabels: Record<number, string> = {
        0: '❓ Unknown',
        1: '✓ Brand Statement',
        2: '✓✓ Policy Reviewed',
        3: '🔬 Lab Tested',
        4: '🔬+ Monitored',
      };
      return {
        title,
        subtitle: `${subtitle || 'No brand'} • ${tierLabels[tier] || 'Unknown'}`,
        media,
      };
    },
  },
});
