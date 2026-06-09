import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import RegisterComp from "@/components/RegisterComp/RegisterComp";
import RegisterComp2 from "@/components/RegisterComp2/RegisterComp2";
import RegisterComp3 from "@/components/RegisterComp3/RegisterComp3";
import { cookies } from "next/headers";
import Link from "next/link";
import Script from "next/script";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/webinars/get-webinar-by-slug?slug=${slug}`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const webinar = data.success ? data.response : null;

  if (!webinar) {
    return {
      title: "Webinar Not Found",
      description: "This webinar is not available.",
    };
  }

  return {
    title: webinar.metaTitle || webinar.title,
    description: webinar.metaDescription || webinar.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${slug}`,
    },
    openGraph: {
      title: webinar.metaTitle || webinar.title,
      description: webinar.metaDescription || webinar.description,
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${slug}`,
      images: [
        {
          url: webinar.ogImage?.url,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function Register({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies(); // synchronous

  const utm = {
    utm_source: cookieStore.get("utm_source")?.value || null,
    utm_medium: cookieStore.get("utm_medium")?.value || null,
    utm_campaign: cookieStore.get("utm_campaign")?.value || null,
    utm_term: cookieStore.get("utm_term")?.value || null,
    utm_content: cookieStore.get("utm_content")?.value || null,
  };

  console.log("[Server] UTMs:", utm);


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/webinars/get-webinar-by-slug?slug=${slug}`,
    { cache: "no-store" }
  );


  const data = await res.json();

  const webinar = data.success ? data.response : null;

  // Function to capitalize each word
  const capitalizeSlug = (slug) => {
    return slug
      .split('-')             // split by dash
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join(' ');             // join back with spaces
  };


  return (
    <>
      <Script
        id="webinar-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webinar?.schemaMarkup || {}),
        }}
      />
      <Header />
      <section className="landinghero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> &gt;{" "}
            <Link href="/">{webinar.category}</Link> &gt;{" "}
            {capitalizeSlug(webinar.slug)}
          </div>
        </div>
      </section>
      {/* <RegisterComp webinar={webinar} utms={utm} /> */}
    {webinar?.theme === "theme1" ? (
  <RegisterComp webinar={webinar} utms={utm} />
) : webinar?.theme === "theme2" ? (
  <RegisterComp2 webinar={webinar} utms={utm} />
) : (
  <RegisterComp3 webinar={webinar} utms={utm} />
)}
      <Footer />
    </>
  );
}
