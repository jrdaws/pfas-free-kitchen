"use client";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SaaS App</div>
          <div className="flex gap-3 sm:gap-4 items-center">
            <a href="#features" className="hidden sm:inline text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">Features</a>
            <a href="#pricing" className="hidden sm:inline text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">Pricing</a>
            <button className="bg-blue-600 text-white border-none rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-sm cursor-pointer font-medium hover:bg-blue-700">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
            SaaS Template
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
            Export succeeded. Next is wiring real features (auth, billing, db).
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <button className="bg-blue-600 text-white border-none rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold cursor-pointer hover:bg-blue-700">
              Get Started
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Key Features
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-10 sm:mb-12 md:mb-16 px-4">
            Build your SaaS with these powerful integrations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: "Authentication", description: "Ready for Supabase, Clerk, or Auth0" },
              { title: "Payments", description: "Stripe integration ready to configure" },
              { title: "Database", description: "PostgreSQL with Prisma or Drizzle ORM" },
              { title: "API Routes", description: "Next.js API routes with TypeScript" },
              { title: "Email", description: "Transactional email with Resend" },
              { title: "Analytics", description: "Track usage with your preferred analytics" }
            ].map((feature, i) => (
              <div key={i} className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 m-0 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-gray-900 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Simple Pricing
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-10 sm:mb-12 md:mb-16 px-4">
            Choose the plan that fits your needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { name: "Starter", price: "$19", features: ["Up to 100 users", "Basic support", "Core features"] },
              { name: "Pro", price: "$49", features: ["Unlimited users", "Priority support", "All features", "Custom integrations"] }
            ].map((plan, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  {plan.price}<span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal">/mo</span>
                </div>
                <ul className="list-none p-0 mb-6 sm:mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="py-1.5 sm:py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">✓ {feature}</li>
                  ))}
                </ul>
                <button className="w-full bg-blue-600 text-white border-none rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-semibold cursor-pointer hover:bg-blue-700">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm sm:text-base text-gray-400">
            © 2024 SaaS App. Built with Next.js and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
