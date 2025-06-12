import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Droodle - Collaborative Canvas for Creative Teams | Real-time Design & Brainstorming",
  description:
    "Transform your team's creativity with Droodle's infinite collaborative canvas. Real-time drawing, design, and brainstorming tools for remote teams. Start free today.",
  keywords:
    "collaborative canvas, team collaboration, real-time drawing, design tools, brainstorming, whiteboard, creative collaboration, remote work, design platform, droodle",
  authors: [{ name: "Droodle Team" }],
  creator: "Droodle",
  publisher: "Droodle",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://droodle.com",
    siteName: "Droodle",
    title: "Droodle - Collaborative Canvas for Creative Teams",
    description:
      "Transform your team's creativity with real-time collaborative canvas tools. Start creating together today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Droodle - Collaborative Canvas Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Droodle - Collaborative Canvas for Creative Teams",
    description:
      "Transform your team's creativity with real-time collaborative canvas tools.",
    images: ["/twitter-image.jpg"],
    creator: "@droodle",
  },
  alternates: {
    canonical: "https://droodle.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Droodle",
              description:
                "Collaborative canvas platform for creative teams with real-time drawing and design tools",
              url: "https://droodle.com",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free plan available",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "1247",
              },
              author: {
                "@type": "Organization",
                name: "Droodle Team",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: "#000000" }}
      >
        {children}
      </body>
    </html>
  );
}
