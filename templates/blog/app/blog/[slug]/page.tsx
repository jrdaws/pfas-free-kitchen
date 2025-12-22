export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  // In Next.js 15, params is a Promise
  const { slug } = await params;
  // In a real app, fetch post data based on slug
  const post = {
    title: "Getting Started with Next.js 15",
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
    `
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gray-900 no-underline hover:text-gray-700">
            ← Back to Blog
          </a>
        </nav>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Post Header */}
        <div className="bg-white p-12 rounded-xl mb-8 border border-gray-200">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
              {post.author[0]}
            </div>
            <div>
              <div className="text-base font-semibold">{post.author}</div>
              <div className="text-sm text-gray-600">{post.date}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-600 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white p-12 rounded-xl mb-8 border border-gray-200">
          <div className="text-lg leading-relaxed text-gray-800">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('##')) {
                return (
                  <h2 key={i} className="text-3xl font-semibold mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('```')) {
                return (
                  <pre key={i} className="bg-gray-800 text-gray-50 p-6 rounded-lg overflow-auto text-sm my-6">
                    <code>{paragraph.replace(/```\w*\n?/g, '')}</code>
                  </pre>
                );
              }
              if (paragraph.match(/^\d\./)) {
                const items = paragraph.split('\n');
                return (
                  <ol key={i} className="my-4 pl-6">
                    {items.map((item, j) => (
                      <li key={j} className="my-2">
                        {item.replace(/^\d\.\s/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.startsWith('-')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={i} className="my-4 pl-6">
                    {items.map((item, j) => (
                      <li key={j} className="my-2">
                        {item.replace(/^-\s/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="my-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white p-8 rounded-xl mb-8 border border-gray-200">
          <h3 className="mb-4 text-lg font-semibold">
            About the Author
          </h3>
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
              {post.author[0]}
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">
                {post.author}
              </div>
              <p className="m-0 text-gray-600 leading-relaxed">
                {post.authorBio}
              </p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <h3 className="mb-4 text-lg font-semibold">
            Share this article
          </h3>
          <div className="flex gap-3 justify-center">
            {['Twitter', 'LinkedIn', 'Facebook'].map(platform => (
              <button
                key={platform}
                className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm font-medium hover:bg-gray-50"
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
