import { groq } from "next-sanity";

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt,
    "author": author->{ name, image },
    "categories": categories[]->{ title, slug }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, body, mainImage, publishedAt,
    "author": author->{ name, image, bio },
    "categories": categories[]->{ title, slug }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id, title, slug, content, seo
  }
`;

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  body?: unknown[];
  mainImage?: { asset: { _ref: string }; alt?: string };
  publishedAt: string;
  author?: { name: string; image?: { asset: { _ref: string } } };
  categories?: { title: string; slug: { current: string } }[];
}

