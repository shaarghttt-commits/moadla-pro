"use client";

import Script from "next/script";

export default function AdsterraAd2() {
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
          src="https://pl31065921.profitableratecpmnetwork.com/2a/cb/17/2acb175eafdc8586ad4c037ea32155c4.js"
          strategy="afterInteractive"
        />
      </div>
    </section>
  );
}

