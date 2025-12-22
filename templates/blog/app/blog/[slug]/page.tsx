"use client";

export default function BlogPost({ params }: { params: { slug: string } }) {
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
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Header */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px"
      }}>
        <nav style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <a href="/" style={{ fontSize: "20px", fontWeight: "bold", color: "#111", textDecoration: "none" }}>
            ← Back to Blog
          </a>
        </nav>
      </header>

      <article style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Post Header */}
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "12px",
          marginBottom: "32px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <span style={{
              padding: "4px 12px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              {post.category}
            </span>
            <span style={{ fontSize: "12px", color: "#999" }}>{post.readTime}</span>
          </div>

          <h1 style={{
            fontSize: "40px",
            fontWeight: "bold",
            margin: "0 0 16px 0",
            lineHeight: 1.2
          }}>
            {post.title}
          </h1>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "20px"
            }}>
              {post.author[0]}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>{post.author}</div>
              <div style={{ fontSize: "14px", color: "#666" }}>{post.date}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                padding: "4px 12px",
                borderRadius: "12px",
                background: "#f3f4f6",
                color: "#666",
                fontSize: "12px"
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Post Content */}
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "12px",
          marginBottom: "32px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{
            fontSize: "18px",
            lineHeight: 1.8,
            color: "#333"
          }}>
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('##')) {
                return (
                  <h2 key={i} style={{
                    fontSize: "28px",
                    fontWeight: "600",
                    margin: "32px 0 16px 0"
                  }}>
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('```')) {
                return (
                  <pre key={i} style={{
                    background: "#1f2937",
                    color: "#f9fafb",
                    padding: "24px",
                    borderRadius: "8px",
                    overflow: "auto",
                    fontSize: "14px",
                    margin: "24px 0"
                  }}>
                    <code>{paragraph.replace(/```\w*\n?/g, '')}</code>
                  </pre>
                );
              }
              if (paragraph.match(/^\d\./)) {
                const items = paragraph.split('\n');
                return (
                  <ol key={i} style={{
                    margin: "16px 0",
                    paddingLeft: "24px"
                  }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ margin: "8px 0" }}>
                        {item.replace(/^\d\.\s/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.startsWith('-')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={i} style={{
                    margin: "16px 0",
                    paddingLeft: "24px"
                  }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ margin: "8px 0" }}>
                        {item.replace(/^-\s/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} style={{ margin: "16px 0" }}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Author Bio */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "12px",
          marginBottom: "32px",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            About the Author
          </h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "24px",
              flexShrink: 0
            }}>
              {post.author[0]}
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                {post.author}
              </div>
              <p style={{ margin: 0, color: "#666", lineHeight: 1.6 }}>
                {post.authorBio}
              </p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            Share this article
          </h3>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            {['Twitter', 'LinkedIn', 'Facebook'].map(platform => (
              <button key={platform} style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                {platform}
              </button>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
