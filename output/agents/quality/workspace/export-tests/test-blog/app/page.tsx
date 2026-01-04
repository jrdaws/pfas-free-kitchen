"use client";
import { useState } from "react";

export default function BlogHome() {
  const [searchQuery, setSearchQuery] = useState("");

  const posts = [
    {
      slug: "getting-started-nextjs",
      title: "test-blog",
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold dark:text-white">My Blog</div>
          <div className="hidden sm:flex gap-4 md:gap-6 items-center">
            <a href="/" className="text-sm md:text-base text-gray-800 dark:text-gray-200 no-underline hover:text-gray-900 dark:hover:text-white">Home</a>
            <a href="#" className="text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">About</a>
            <a href="#" className="text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">Contact</a>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 dark:text-white">
            Welcome to My Blog
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Thoughts, stories, and ideas about web development, technology, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-12 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-none ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
              } cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap hover:opacity-90`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {filteredPosts.map(post => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1"
            >
              <div className="h-[180px] sm:h-[200px] bg-gradient-to-br from-indigo-500 to-purple-600" />
              <div className="p-4 sm:p-6">
                <div className="flex gap-2 mb-2 sm:mb-3">
                  <span className="px-2 sm:px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
                </div>
                <h2 className="text-lg sm:text-[22px] font-semibold mb-2 sm:mb-3 leading-snug dark:text-white">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {post.author[0]}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium dark:text-white">{post.author}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{post.date}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400">
            No posts found matching your search.
          </div>
        )}

        {/* Newsletter Section */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 md:p-12 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 dark:text-white">
            Subscribe to the Newsletter
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Get the latest posts delivered right to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white border-none rounded-lg px-6 py-2.5 sm:py-3 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-blue-700">
              Subscribe
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
          <div>
            <h3 className="mb-4 text-lg">My Blog</h3>
            <p className="text-gray-400 m-0 text-sm leading-relaxed">
              Sharing knowledge and insights about web development.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm">Categories</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">Tutorial</a>
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">Development</a>
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">Backend</a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm">Social</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">Twitter</a>
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">GitHub</a>
              <a href="#" className="text-gray-400 text-sm no-underline hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          © 2024 My Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
