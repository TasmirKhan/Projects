import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tasmir Khan | AI/ML Engineer Portfolio",
  description: "Premium portfolio of Tasmir Khan - AI/ML Engineer, Software Developer, DSA Enthusiast.",
  keywords: ["Tasmir Khan", "AI Engineer", "ML", "DSA", "Portfolio"],
  openGraph: { title: "Tasmir Khan Portfolio", description: "Recruiter-focused AI/ML portfolio", type: "website" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}<Toaster richColors /></ThemeProvider>
      </body>
    </html>
  );
}
