"use client";
import { useState } from "react";

export default function BlogHome() {
  const [searchQuery, setSearchQuery] = useState("");

  const posts = [
    {
      slug: "getting-started-nextjs",
      title: "Getting Started with Next.js 15",
      excerpt: "Learn how to build modern web applications with the latest version of Next.js. We'll cover App Router, Server Components, and more.",
      author: "Sarah Johnson",
      authorBio: "Full-stack developer and tech writer",
      date: "Dec 20, 2024",
      readTime: "5 min read",
      category: "Tutorial",
      tags: ["nextjs", "react", "tutorial"]
    },
    {
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices for 2024",
      excerpt: "Discover the most effective TypeScript patterns and practices to write safer, more maintainable code in your projects.",
      author: "Mike Chen",
      authorBio: "Senior TypeScript engineer",
      date: "Dec 18, 2024",
      readTime: "8 min read",
      category: "Development",
      tags: ["typescript", "best-practices", "coding"]
    },
    {
      slug: "building-scalable-apis",
      title: "Building Scalable REST APIs",
      excerpt: "A comprehensive guide to designing and implementing REST APIs that can handle millions of requests with ease.",
      author: "Emma Davis",
      authorBio: "Backend architect",
      date: "Dec 15, 2024",
      readTime: "12 min read",
      category: "Backend",
      tags: ["api", "rest", "scalability"]
    },
    {
      slug: "react-performance-tips",
      title: "10 React Performance Tips",
      excerpt: "Optimize your React applications with these proven performance techniques. From memoization to code splitting.",
      author: "Sarah Johnson",
      authorBio: "Full-stack developer and tech writer",
      date: "Dec 12, 2024",
      readTime: "6 min read",
      category: "React",
      tags: ["react", "performance", "optimization"]
    },
    {
      slug: "database-indexing-guide",
      title: "Database Indexing: A Complete Guide",
      excerpt: "Master database indexing strategies to dramatically improve query performance and application speed.",
      author: "Mike Chen",
      authorBio: "Senior TypeScript engineer",
      date: "Dec 10, 2024",
      readTime: "10 min read",
      category: "Database",
      tags: ["database", "sql", "performance"]
    }
  ];

  const categories = ["All", "Tutorial", "Development", "Backend", "React", "Database"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: "100vh" }}>
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
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>My Blog</div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a href="/" style={{ color: "#333", textDecoration: "none" }}>Home</a>
            <a href="#" style={{ color: "#666", textDecoration: "none" }}>About</a>
            <a href="#" style={{ color: "#666", textDecoration: "none" }}>Contact</a>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 16px 0" }}>
            Welcome to My Blog
          </h1>
          <p style={{ fontSize: "18px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
            Thoughts, stories, and ideas about web development, technology, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "32px" }}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "white"
            }}
          />
        </div>

        {/* Category Filter */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "48px",
          overflowX: "auto",
          paddingBottom: "8px"
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: selectedCategory === cat ? "#2563eb" : "white",
                color: selectedCategory === cat ? "white" : "#333",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                boxShadow: selectedCategory === cat ? "none" : "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "32px",
          marginBottom: "48px"
        }}>
          {filteredPosts.map(post => (
            <article key={post.slug} style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer"
            }}>
              <div style={{
                height: "200px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }} />
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
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
                <h2 style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  margin: "0 0 12px 0",
                  lineHeight: 1.3
                }}>
                  {post.title}
                </h2>
                <p style={{
                  color: "#666",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  margin: "0 0 16px 0"
                }}>
                  {post.excerpt}
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}>
                    {post.author[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>{post.author}</div>
                    <div style={{ fontSize: "12px", color: "#999" }}>{post.date}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "48px",
            color: "#666"
          }}>
            No posts found matching your search.
          </div>
        )}

        {/* Newsletter Section */}
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 12px 0" }}>
            Subscribe to the Newsletter
          </h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Get the latest posts delivered right to your inbox.
          </p>
          <div style={{
            display: "flex",
            gap: "12px",
            maxWidth: "500px",
            margin: "0 auto"
          }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            />
            <button style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
              Subscribe
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: "#111",
        color: "white",
        padding: "48px 24px",
        marginTop: "64px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px"
        }}>
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>My Blog</h3>
            <p style={{ color: "#999", margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
              Sharing knowledge and insights about web development.
            </p>
          </div>
          <div>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Categories</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>Tutorial</a>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>Development</a>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>Backend</a>
            </div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Social</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>Twitter</a>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>GitHub</a>
              <a href="#" style={{ color: "#999", fontSize: "14px", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid #333",
          marginTop: "32px",
          paddingTop: "24px",
          textAlign: "center",
          color: "#999",
          fontSize: "14px"
        }}>
          © 2024 My Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
