import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Studio | Dawson Framework",
  description: "Generate photorealistic images for your projects",
};

export default function MediaStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-terminal-bg">
      {children}
    </div>
  );
}

