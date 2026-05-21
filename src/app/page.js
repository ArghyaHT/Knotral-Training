import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import TrustBar from "@/components/TrustBar/TrustBar";
import LiveSessions from "@/components/LiveSessions/LiveSessions";
import Category from "@/components/Category/Category";
import FeaturedPrograms from "@/components/FeaturedPrograms/FeaturedPrograms";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import Testimonials from "@/components/Testimionials/Testimonials";
import CtaSection from "@/components/CtaSection/CtaSection";
import Footer from "@/components/Footer/Footer";
import Head from "next/head";
import PastSessions from "@/components/PastSessions/PastSessions";

export const revalidate = 0; // optional, for no caching

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/webinars/get-webinars`,
    { cache: "no-store" } // ensures SSR, fresh data
  );
  const data = await res.json();
  const webinars = data.success ? data.response : [];

  // Filter certified webinars
  const certifiedWebinars = webinars.filter(webinar => webinar.isCertified);

  const pastSessionsWebinars = webinars.filter(webinar => webinar.isStopped);

  // Example JSON-LD structured data
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://training.knotral.com/#organization",
        "name": "Knotral Trainings",
        "alternateName": "Knotral",
        "url": "https://training.knotral.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://training.knotral.com/7.png",
          "width": 400,
          "height": 100
        },
        "description": "Free professional development from global EdTech leaders. Live webinars, certifications, and classroom-ready strategies for Indian educators.",
        "slogan": "Knowledge. Trade. Link.",
        "telephone": "+91-9311526122",
        "email": "info@knotral.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Fardiabad",
          "addressCountry": "IN"
        },
        "sameAs": [
          "https://www.linkedin.com/company/knotral",
          "https://twitter.com/knotral"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "234"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://training.knotral.com/#website",
        "url": "https://training.knotral.com/",
        "name": "Knotral Trainings",
        "description": "Free professional development platform connecting Indian educators with global EdTech leaders",
        "publisher": {
          "@id": "https://training.knotral.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://training.knotral.com/webinars?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "EducationalOrganization",
        "name": "Knotral Trainings",
        "url": "https://training.knotral.com/",
        "numberOfStudents": "12000",
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "Professional Development",
          "numberOfCredits": "30+"
        }
      }
    ]
  };
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          // JSON must be stringified
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <Header />
      <Hero webinars={webinars} />
      <TrustBar />
      <LiveSessions webinars={webinars} />
      <Category />
      {/* <FeaturedPrograms webinars={certifiedWebinars} /> */}
      <PastSessions webinars={pastSessionsWebinars} />
      <LogoStrip />
      <Testimonials />
      <CtaSection />
      <Footer />
    </>
  );
}
