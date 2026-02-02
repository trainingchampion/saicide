
import React from "react";

export default function Footer() {
  const integrations = [
    {
      name: "Stripe",
      url: "https://cdn.simpleicons.org/stripe/475569",
    },
    {
      name: "Snowflake",
      url: "https://cdn.simpleicons.org/snowflake/475569",
    },
    {
      name: "GitHub",
      url: "https://cdn.simpleicons.org/github/475569",
    },
    {
      name: "Notion",
      url: "https://cdn.simpleicons.org/notion/475569",
    },
    {
      name: "Zapier",
      url: "https://cdn.simpleicons.org/zapier/475569",
    },
    {
      name: "Netlify",
      url: "https://cdn.simpleicons.org/netlify/475569",
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 py-12 flex flex-col items-center w-full">
      {/* Icon Row */}
      <div className="flex justify-center gap-16 mb-8 flex-wrap">
        {integrations.map((item, index) => (
          <img
            key={index}
            src={item.url}
            alt={item.name}
            className="w-8 h-8 opacity-60 hover:opacity-100 transition-opacity duration-300"
          />
        ))}
      </div>

      {/* Copyright */}
      <p className="text-slate-500 text-sm text-center font-medium">
        © 2025 <span className="font-bold text-blue-600">S.AI</span> made with{" "}
        <span className="text-red-500/80">❤️</span> by{" "}
        <span className="font-bold text-emerald-600">SSlabs</span> — All rights reserved.
      </p>
    </footer>
  );
}
