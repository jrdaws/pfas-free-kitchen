"use client";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    console.log("✅ Ready at http://localhost:3000");
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>SaaS Template</h1>
      <p style={{ marginTop: 8 }}>
        Export succeeded. Next is wiring real features (auth, billing, db).
      </p>
    </main>
  );
}
