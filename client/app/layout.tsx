import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lathurzan Subatharan | Full-Stack Software Engineer",
  description:
    "AI/ML-focused full-stack software engineer building scalable web applications, backend systems, and AI-powered products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
  <ConditionalNavbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}