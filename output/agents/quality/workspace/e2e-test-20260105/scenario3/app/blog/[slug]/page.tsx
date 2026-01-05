import Link from "next/link";
import { CommentSection } from "@/components/blog/CommentSection";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

// Mock data - in a real app, fetch from database/CMS
const allPosts = [
  {
    slug: "getting-started-nextjs",
    title: "scenario3-content",
    excerpt: "Learn how to build modern web applications with the latest version of Next.js.",
    author: "Sarah Johnson",
    authorBio: "Full-stack developer and tech writer passionate about making complex topics accessible.",
    date: "December 20, 2024",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["nextjs", "react", "tutorial", "web-development"],
    content: `
Next.js 15 brings exciting new features that make building web applications even more powerful and efficient. In this comprehensive guide, we'll explore the key improvements and how to get started.

## What's New in Next.js 15?

Next.js 15 introduces several groundbreaking features:

- **Enhanced App Router**: Improved performance and developer experience
- **Server Components by default**: Better performance out of the box
- **Improved TypeScript support**: Stronger type safety
- **Better image optimization**: Faster loading times

## Getting Started

Let's start by creating a new Next.js 15 project:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Server Components

One of the most powerful features is Server Components. They allow you to render components on the server, reducing the JavaScript sent to the client.

\`\`\`tsx
// This is a Server Component by default
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()

  return <div>{json.message}</div>
}
\`\`\`

## Best Practices

Here are some best practices when working with Next.js 15:

1. Use Server Components by default
2. Only use 'use client' when necessary
3. Leverage the new metadata API for SEO
4. Take advantage of incremental static regeneration

## Conclusion

Next.js 15 is a significant step forward in web development. Its focus on performance and developer experience makes it an excellent choice for your next project.
    `,
  },
  {
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices for 2024",
    excerpt: "Discover the most effective TypeScript patterns and practices.",
    author: "Mike Chen",
    authorBio: "Senior TypeScript engineer with 10+ years of experience.",
    date: "December 18, 2024",
    readTime: "8 min read",
    category: "Development",
    tags: ["typescript", "best-practices"],
    content: "TypeScript content here...",
  },
  {
    slug: "building-scalable-apis",
    title: "Building Scalable REST APIs",
    excerpt: "A comprehensive guide to designing REST APIs.",
    author: "Emma Davis",
    authorBio: "Backend architect specializing in distributed systems.",
    date: "December 15, 2024",
    readTime: "12 min read",
    category: "Backend",
    tags: ["api", "rest", "backend"],
    content: "API content here...",
  },
  {
    slug: "react-performance-tips",
    title: "10 React Performance Tips",
    excerpt: "Optimize your React applications.",
    author: "Sarah Johnson",
    authorBio: "Full-stack developer and tech writer.",
    date: "December 12, 2024",
    readTime: "6 min read",
    category: "React",
    tags: ["react", "performance"],
    content: "React performance content here...",
  },
];

// Mock comments
const mockComments = [
  {
    id: "1",
    author: { name: "John Developer" },
    content: "Great article! This helped me understand Server Components much better.",
    date: "2 days ago",
  },
  {
    id: "2",
    author: { name: "Alice Tech" },
    content: "Thanks for the clear examples. Looking forward to more content like this!",
    date: "3 days ago",
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (same category, different post)
  const relatedPosts = allPosts
    .filter((p) => p.category === post.category && p.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 dark:text-white no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back to Blog
          </Link>
        </nav>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Post Header */}
        <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              {post.category}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight dark:text-white">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
              {post.author[0]}
            </div>
            <div>
              <div className="text-base font-semibold dark:text-white">{post.author}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{post.date}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl mb-8 border border-gray-200 dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("##")) {
                return (
                  <h2 key={i} className="text-2xl font-semibold mt-8 mb-4 dark:text-white">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("```")) {
                return (
                  <pre key={i} className="bg-gray-900 text-gray-50 p-6 rounded-lg overflow-auto text-sm my-6">
                    <code>{paragraph.replace(/```\w*\n?/g, "")}</code>
                  </pre>
                );
              }
              if (paragraph.match(/^\d\./)) {
                const items = paragraph.split("\n");
                return (
                  <ol key={i} className="my-4 pl-6 list-decimal dark:text-gray-300">
                    {items.map((item, j) => (
                      <li key={j} className="my-2">
                        {item.replace(/^\d\.\s/, "")}
                      </li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.startsWith("-")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={i} className="my-4 pl-6 list-disc dark:text-gray-300">
                    {items.map((item, j) => (
                      <li key={j} className="my-2">
                        {item.replace(/^-\s/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">About the Author</h3>
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
              {post.author[0]}
            </div>
            <div>
              <div className="text-lg font-semibold mb-2 dark:text-white">{post.author}</div>
              <p className="m-0 text-gray-600 dark:text-gray-400 leading-relaxed">{post.authorBio}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-8">
            <RelatedPosts posts={relatedPosts} currentPostSlug={slug} />
          </div>
        )}

        {/* Comments Section */}
        <CommentSection postId={slug} comments={mockComments} />

        {/* Share Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center mt-8">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">Share this article</h3>
          <div className="flex gap-3 justify-center">
            {["Twitter", "LinkedIn", "Facebook"].map((platform) => (
              <button
                key={platform}
                className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}
