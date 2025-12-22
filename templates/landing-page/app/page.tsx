"use client";

export default function LandingPage() {
  const features = [
    { title: "Fast Performance", description: "Optimized for speed and efficiency" },
    { title: "Easy to Use", description: "Intuitive interface that anyone can master" },
    { title: "Secure", description: "Enterprise-grade security built-in" },
    { title: "Scalable", description: "Grows with your business needs" },
    { title: "24/7 Support", description: "We're here to help anytime" },
    { title: "Analytics", description: "Deep insights into your data" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "CEO, TechCorp", quote: "This product transformed how we work. Highly recommended!" },
    { name: "Mike Chen", role: "Developer", quote: "The best tool I've used. Simple yet powerful." },
    { name: "Emma Davis", role: "Product Manager", quote: "Our team's productivity increased by 300%." }
  ];

  const faqs = [
    { question: "How does it work?", answer: "Our platform uses cutting-edge technology to deliver exceptional results." },
    { question: "Is there a free trial?", answer: "Yes! Try it free for 14 days, no credit card required." },
    { question: "Can I cancel anytime?", answer: "Absolutely. Cancel your subscription anytime with one click." },
    { question: "What support do you offer?", answer: "We provide 24/7 email and chat support for all customers." }
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">YourBrand</div>
        <div className="hidden sm:flex gap-4 md:gap-6 items-center">
          <a href="#features" className="text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">Features</a>
          <a href="#pricing" className="text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">Pricing</a>
          <a href="#faq" className="text-sm md:text-base text-gray-600 dark:text-gray-300 no-underline hover:text-gray-900 dark:hover:text-white">FAQ</a>
          <button className="bg-blue-600 text-white border-none rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-sm cursor-pointer font-medium hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 sm:px-6 py-16 sm:py-24 md:py-30 text-center text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          Build Something Amazing
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 opacity-95 px-4">
          The fastest way to ship your next project. Start building in minutes, not hours.
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
          <button className="bg-white text-indigo-500 border-none rounded-lg px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold cursor-pointer hover:bg-gray-50">
            Start Free Trial
          </button>
          <button className="bg-transparent text-white border-2 border-white rounded-lg px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold cursor-pointer hover:bg-white/10">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 dark:text-white">
          Everything You Need
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16 px-4">
          Powerful features to help you build, ship, and scale your product.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 m-0 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 md:mb-16 dark:text-white">
            Loved by Customers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <p className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 dark:text-white">
          Simple Pricing
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16 px-4">
          Choose the plan that's right for you. Always flexible, always fair.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "$9", features: ["5 Projects", "Basic Support", "1GB Storage"] },
            { name: "Pro", price: "$29", features: ["Unlimited Projects", "Priority Support", "10GB Storage", "Advanced Analytics"], popular: true },
            { name: "Enterprise", price: "$99", features: ["Everything in Pro", "24/7 Support", "Unlimited Storage", "Custom Integrations"] }
          ].map((plan, i) => (
            <div key={i} className={`p-6 sm:p-8 rounded-xl ${plan.popular ? 'border-2 border-indigo-500' : 'border border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 relative`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs font-semibold">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 dark:text-white">{plan.name}</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 dark:text-white">
                {plan.price}<span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal">/mo</span>
              </div>
              <ul className="list-none p-0 mb-6 sm:mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="py-1.5 sm:py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">✓ {feature}</li>
                ))}
              </ul>
              <button className={`w-full ${plan.popular ? 'bg-indigo-500 text-white border-none' : 'bg-white dark:bg-gray-900 text-indigo-500 dark:text-indigo-400 border-2 border-indigo-500 dark:border-indigo-400'} rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-semibold cursor-pointer hover:opacity-90`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 md:mb-16 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3 sm:gap-4">
            {faqs.map((faq, i) => (
              <details key={i} className="p-5 sm:p-6 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <summary className="text-base sm:text-lg font-semibold cursor-pointer list-none dark:text-white">
                  {faq.question}
                </summary>
                <p className="mt-3 sm:mt-4 mb-0 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-95 px-4">
          Join thousands of happy customers today.
        </p>
        <button className="bg-white text-indigo-500 border-none rounded-lg px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold cursor-pointer hover:bg-gray-50">
          Start Your Free Trial
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            <div>
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">YourBrand</h3>
              <p className="text-gray-400 m-0 leading-relaxed text-sm sm:text-base">
                Building the future, one line of code at a time.
              </p>
            </div>
            <div>
              <h4 className="mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Features</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Pricing</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">About</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Blog</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Careers</a>
              </div>
            </div>
            <div>
              <h4 className="mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Privacy</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Terms</a>
                <a href="#" className="text-gray-400 no-underline hover:text-white text-sm sm:text-base">Security</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
            © 2024 YourBrand. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
