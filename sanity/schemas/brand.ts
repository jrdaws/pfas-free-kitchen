import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Brand Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'pfasPolicy',
      title: 'PFAS Policy',
      type: 'text',
      description: 'Brand\'s official statement on PFAS in their products',
    }),
    defineField({
      name: 'overallTrust',
      title: 'Overall Trust Level',
      type: 'string',
      options: {
        list: [
          { title: 'High Trust - Verified PFAS-free', value: 'high' },
          { title: 'Medium Trust - Brand statement only', value: 'medium' },
          { title: 'Low Trust - Unclear policies', value: 'low' },
          { title: 'Avoid - Known PFAS use', value: 'avoid' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      trust: 'overallTrust',
    },
    prepare({ title, media, trust }) {
      const trustEmoji: Record<string, string> = {
        high: '🟢',
        medium: '🟡',
        low: '🟠',
        avoid: '🔴',
      };
      return {
        title: `${trustEmoji[trust] || '⚪'} ${title}`,
        media,
      };
    },
  },
});
