import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});


export const metadata = {
  title: "Knotral Trainings",
  description: "Free professional development from global EdTech leaders. Live webinars, certifications, and classroom-ready strategies for Indian educators.",
  icons: {
    icon: "/icon.jpeg",
  },
  alternates: {
    canonical: "https://training.knotral.com/",
  },

  openGraph: {
    title: "Knotral Trainings",
    description:
      "Free professional development from global EdTech leaders. Live webinars, certifications, and classroom-ready strategies for Indian educators.",
    url: "https://training.knotral.com/",
    siteName: "Knotral Trainings",
    images: [
      {
        url: "https://training.knotral.com/icon.jpeg",
        width: 1200,
        height: 630,
        alt: "Knotral Trainings",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Knotral Trainings",
    description:
      "Free professional development from global EdTech leaders. Live webinars, certifications, and classroom-ready strategies for Indian educators.",
    images: ["https://training.knotral.com/icon.jpeg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SBJ04K6437"
        />

        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SBJ04K6437');
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PJS7MZW6');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>

          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PJS7MZW6"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
          {/* End Google Tag Manager (noscript) */}

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
