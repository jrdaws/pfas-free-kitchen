import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Pricing } from '@/components/Pricing';
import { CallToAction } from '@/components/CallToAction';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero 
        title="Manage Your Tasks Effortlessly"
        description="The ultimate task management solution for teams and individuals"
        cta={{ label: "Get Started Free", link: "/dashboard" }}
      />
      <Features 
        features={[
          { title: "Smart Organization", description: "Organize tasks with intelligent categorization", icon: "📋" },
          { title: "Team Collaboration", description: "Work together seamlessly with your team", icon: "👥" },
          { title: "Progress Tracking", description: "Monitor your productivity and achievements", icon: "📊" }
        ]}
      />
      <Pricing 
        plans={[
          { name: "Free", description: "Perfect for individuals", price: 0, features: ["Up to 10 tasks", "Basic organization", "Mobile app"] },
          { name: "Pro", description: "For growing teams", price: 19, features: ["Unlimited tasks", "Team collaboration", "Advanced analytics", "Priority support"] }
        ]}
      />
      <CallToAction />
    </main>
  );
}