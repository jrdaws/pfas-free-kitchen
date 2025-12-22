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
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* Navigation */}
      <nav style={{
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111" }}>YourBrand</div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="#features" style={{ color: "#666", textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ color: "#666", textDecoration: "none" }}>Pricing</a>
          <a href="#faq" style={{ color: "#666", textDecoration: "none" }}>FAQ</a>
          <button style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "500"
          }}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "120px 24px",
        textAlign: "center",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "56px",
          fontWeight: "bold",
          margin: "0 0 24px 0",
          lineHeight: 1.2
        }}>
          Build Something Amazing
        </h1>
        <p style={{
          fontSize: "20px",
          maxWidth: "600px",
          margin: "0 auto 32px",
          opacity: 0.95
        }}>
          The fastest way to ship your next project. Start building in minutes, not hours.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button style={{
            background: "white",
            color: "#667eea",
            border: "none",
            borderRadius: "8px",
            padding: "14px 28px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}>Start Free Trial</button>
          <button style={{
            background: "transparent",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            padding: "14px 28px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}>Watch Demo</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "40px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          Everything You Need
        </h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: "18px", maxWidth: "600px", margin: "0 auto 64px" }}>
          Powerful features to help you build, ship, and scale your product.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px"
        }}>
          {features.map((feature, i) => (
            <div key={i} style={{
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "white"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                marginBottom: "16px"
              }} />
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 8px 0" }}>
                {feature.title}
              </h3>
              <p style={{ color: "#666", margin: 0, lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ background: "#f9fafb", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "40px", fontWeight: "bold", margin: "0 0 64px 0" }}>
            Loved by Customers
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}>
            {testimonials.map((testimonial, i) => (
              <div key={i} style={{
                padding: "32px",
                borderRadius: "12px",
                background: "white",
                border: "1px solid #e5e7eb"
              }}>
                <p style={{ fontSize: "16px", lineHeight: 1.7, margin: "0 0 24px 0", color: "#333" }}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: "600", color: "#111" }}>{testimonial.name}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "40px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          Simple Pricing
        </h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: "18px", maxWidth: "600px", margin: "0 auto 64px" }}>
          Choose the plan that's right for you. Always flexible, always fair.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          maxWidth: "900px",
          margin: "0 auto"
        }}>
          {[
            { name: "Starter", price: "$9", features: ["5 Projects", "Basic Support", "1GB Storage"] },
            { name: "Pro", price: "$29", features: ["Unlimited Projects", "Priority Support", "10GB Storage", "Advanced Analytics"], popular: true },
            { name: "Enterprise", price: "$99", features: ["Everything in Pro", "24/7 Support", "Unlimited Storage", "Custom Integrations"] }
          ].map((plan, i) => (
            <div key={i} style={{
              padding: "32px",
              borderRadius: "12px",
              border: plan.popular ? "2px solid #667eea" : "1px solid #e5e7eb",
              background: "white",
              position: "relative"
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#667eea",
                  color: "white",
                  padding: "4px 16px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>POPULAR</div>
              )}
              <h3 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 8px 0" }}>{plan.name}</h3>
              <div style={{ fontSize: "40px", fontWeight: "bold", margin: "0 0 24px 0" }}>
                {plan.price}<span style={{ fontSize: "18px", color: "#666", fontWeight: "normal" }}>/mo</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{ padding: "8px 0", color: "#666" }}>✓ {feature}</li>
                ))}
              </ul>
              <button style={{
                width: "100%",
                background: plan.popular ? "#667eea" : "white",
                color: plan.popular ? "white" : "#667eea",
                border: plan.popular ? "none" : "2px solid #667eea",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ background: "#f9fafb", padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "40px", fontWeight: "bold", margin: "0 0 64px 0" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{
                padding: "24px",
                borderRadius: "12px",
                background: "white",
                border: "1px solid #e5e7eb"
              }}>
                <summary style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: "pointer",
                  listStyle: "none"
                }}>{faq.question}</summary>
                <p style={{ margin: "16px 0 0 0", color: "#666", lineHeight: 1.7 }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "80px 24px",
        textAlign: "center",
        color: "white"
      }}>
        <h2 style={{ fontSize: "40px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: "18px", margin: "0 0 32px 0", opacity: 0.95 }}>
          Join thousands of happy customers today.
        </p>
        <button style={{
          background: "white",
          color: "#667eea",
          border: "none",
          borderRadius: "8px",
          padding: "14px 28px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer"
        }}>Start Your Free Trial</button>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#111",
        color: "white",
        padding: "64px 24px 32px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            marginBottom: "48px"
          }}>
            <div>
              <h3 style={{ margin: "0 0 16px 0" }}>YourBrand</h3>
              <p style={{ color: "#999", margin: 0, lineHeight: 1.6 }}>
                Building the future, one line of code at a time.
              </p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 16px 0" }}>Product</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Features</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Pricing</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>FAQ</a>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 16px 0" }}>Company</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>About</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Blog</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Careers</a>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 16px 0" }}>Legal</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Privacy</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Terms</a>
                <a href="#" style={{ color: "#999", textDecoration: "none" }}>Security</a>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: "1px solid #333",
            paddingTop: "32px",
            textAlign: "center",
            color: "#999"
          }}>
            © 2024 YourBrand. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
