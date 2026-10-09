import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./ui-polish.css";
import "./scroll-zoom.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollZoom from "@/components/ScrollZoom";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import AuthHashHandler from "@/components/AuthHashHandler";
import GlobalFocusBar from "@/components/GlobalFocusBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineSync from "@/components/OfflineSync";
import LiveRefresh from "@/components/LiveRefresh";
import StructuralBackBridge from "@/components/StructuralBackBridge";
import GlobalToolOverlay from "@/components/learning/GlobalToolOverlay";

export const metadata: Metadata = {
  title: "Wisdom Tower Academy | Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam",
  description:
    "Wisdom Tower Academy: pathways for Grades 9-12, Freshman, UAT, GAT, COC and Exit Exam. Learn, practice, and unlock packages.",
  keywords: [
    "Wisdom Tower Academy",
    "Ethiopia education",
    "GAT",
    "UAT",
    "Exit Exam",
    "Freshman",
    "COC",
    "online learning",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wisdom Tower Academy",
  },
  openGraph: {
    title: "Wisdom Tower Academy",
    description:
      "Structured learning platform for Ethiopian students preparing for high-stakes exams (GAT, UAT, COC, Exit Exam, Grades 9–12, and freshman year).",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const ua = headerList.get("user-agent") || "";
  const isApp = ua.includes("WisdomTowerApp");

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`theme-dark dark ${isApp ? "wta-app-mode wta-native-app" : ""}`}
      data-theme="dark"
      data-wta-app={isApp ? "1" : undefined}
      style={{
        colorScheme: "dark",
        backgroundColor: "#060B15",
      }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.setItem('wt-theme','dark');var d=document.documentElement;d.classList.remove('theme-light','light');d.classList.add('theme-dark','dark');d.style.colorScheme='dark';d.setAttribute('data-theme','dark');var p=localStorage.getItem('wt-preferences');if(p){var parsed=JSON.parse(p);if(parsed.amoledMode)d.classList.add('amoled-mode');if(parsed.reducedMotion)d.classList.add('force-reduced-motion');if(parsed.fontSize)d.classList.add('font-scale-'+parsed.fontSize);if(parsed.readingFont)d.classList.add('reading-font-'+parsed.readingFont);}var ua=navigator.userAgent||'';var search=window.location.search||'';var hash=window.location.hash||'';var isApp=(ua.indexOf('WisdomTowerApp')!==-1)||Boolean(window.Android||window.AndroidBridge||window.WisdomTower||window.wtaNative||window.__wtaNativeApp)||/(?:[?&])(?:app|native|wta|platform)=(?:1|true|android|wta)/i.test(search)||/(?:[#&])(?:app|native|wta)=(?:1|true|android|wta)/i.test(hash);if(isApp){d.setAttribute('data-wta-app','1');d.classList.add('wta-app-mode','wta-native-app');d.style.backgroundColor='#060B15';d.style.colorScheme='dark';}var isOverlay=/(?:[?&])(?:overlay|standalone|embed)=(?:1|true)/i.test(search)||(window.self!==window.top);var isTutor=/(?:[?&])(?:tool|tab)=(?:tutor|ai-tutor)/i.test(search);if(isOverlay||(isApp&&isTutor)){d.classList.add('wta-tool-overlay');}if(isTutor&&window.innerWidth<640){d.classList.add('wta-tutor-active');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`min-h-screen flex flex-col antialiased font-sans site-bg text-foreground ${isApp ? "wta-app-mode wta-native-app" : ""}`}
        style={{
          colorScheme: "dark",
          backgroundColor: "#060B15",
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="site-atmosphere" aria-hidden>
              <div className="atm-base" />
              <div className="atm-vignette" />
              <div className="atm-glow atm-glow-1" />
              <div className="atm-glow atm-glow-2" />
              <div className="atm-glow atm-glow-3" />
              <div className="atm-noise" />
            </div>
            {!isApp && <Header />}
            <main className={`flex-1 relative z-10 ${isApp ? "pt-0" : "pt-16"}`}>{children}</main>
            {!isApp && <Footer />}
            <AuthHashHandler />
            <ScrollZoom />
            <GlobalFocusBar />
            <ServiceWorkerRegister />
            <OfflineSync />
            <LiveRefresh />
            <StructuralBackBridge />
            <GlobalToolOverlay />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
