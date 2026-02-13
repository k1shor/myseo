import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "../lib/seo";

export async function generateMetadata() {
  // Server-side metadata (fetch settings from backend)
  try {
    const settings = await getSiteSettings();
    return {
      title: settings?.defaultMetaTitle || "MySEO — Digital Marketing & SEO",
      description: settings?.defaultMetaDescription || "Elegant SEO-first blog and services for brands that want measurable growth.",
      keywords: settings?.defaultKeywords || ["seo", "digital marketing", "content strategy"],
      openGraph: {
        title: settings?.defaultMetaTitle || "MySEO",
        description: settings?.defaultMetaDescription || "",
        type: "website"
      }
    };
  } catch {
    return {
      title: "MySEO — Digital Marketing & SEO",
      description: "Elegant SEO-first blog and services for brands that want measurable growth."
    };
  }
}

export default async function RootLayout({ children }) {
  let settings = null;
  try { settings = await getSiteSettings(); } catch {}

  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Navbar />
        {children}
        <Footer settings={settings} />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
