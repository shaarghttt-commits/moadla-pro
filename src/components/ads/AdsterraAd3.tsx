"use client";

import Script from "next/script";

export default function AdsterraAd3() {
  return (
    <section
      className="w-full flex justify-center items-center py-6"
      aria-label="Advertisement"
    >
      <div
        className="w-full flex justify-center items-center overflow-hidden"
        style={{ minHeight: "100px" }}
      >
        <Script
          src="https://pl31065922.profitableratecpmnetwork.com/50/8d/bd/508dbd9cee9f4a01c3e6fdb7c6689c7b.js"
          strategy="afterInteractive"
        />
      </div>
    </section>
  );
}

