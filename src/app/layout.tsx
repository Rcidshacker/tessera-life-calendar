import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Tessera — Life in Dots",
  description:
    "Visualize your entire life as a grid of weeks. Journal every moment, track your mood, and receive AI-powered insights about your journey.",
  keywords: ["life tracking", "journaling", "mood tracking", "life visualization", "AI insights"],
  authors: [{ name: "Tessera" }],
  openGraph: {
    title: "Tessera — Life in Dots",
    description: "Your life, one week at a time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tessera — Life in Dots",
    description: "Your life, one week at a time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
