import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { hasSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  applicationName: "Error Book",
  title: {
    default: "Integration Error Book",
    template: "%s · Integration Error Book",
  },
  description:
    "Look up IDoc and SAP Integration Suite errors, the SAP Community fix, and what worked in your landscape.",
  appleWebApp: {
    capable: true,
    title: "Error Book",
    statusBarStyle: "black",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const signedIn = await hasSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-background">
        <SiteHeader signedIn={signedIn} />
        <div className="flex min-w-0 flex-1 flex-col pt-[var(--app-header-height)]">
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
