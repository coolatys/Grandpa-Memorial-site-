import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Grandpa's Memorial Site",
  description: "A digital tribute and memorial site.",
};

import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Cache layout data for 60 seconds

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let primaryColor = "#2F4538";
  let secondaryColor = "#EAE6DF";
  let accentColor = "#C39958";

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('primary_color, secondary_color, accent_color')
      .single();

    const settings = data as any;
    if (settings) {
      if (settings.primary_color) primaryColor = settings.primary_color;
      if (settings.secondary_color) secondaryColor = settings.secondary_color;
      if (settings.accent_color) accentColor = settings.accent_color;
    }
  } catch (err) {
    console.error("Failed to load settings:", err);
  }

  return (
    <html lang="en">
      <body 
        className={`${inter.variable} ${playfair.variable} antialiased bg-stone-50 text-stone-900 font-sans`}
        style={{
          '--color-primary': primaryColor,
          '--color-secondary': secondaryColor,
          '--color-accent': accentColor,
        } as React.CSSProperties}
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
