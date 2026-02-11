import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/store/useSiteSettings";

type SeoHeadProps = {
  pageTitle?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
};

export const SeoHead = ({
  pageTitle,
  description,
  canonicalUrl,
  ogImage,
}: SeoHeadProps) => {
  const settings = useSiteSettings((s) => s.settings);

  /* -----------------------------
     SINGLE SOURCE OF TRUTH
  ----------------------------- */

  const brandName =
    settings?.brandName ||
    import.meta.env.VITE_SEO_TITLE ||
    "Music Store";

  const finalTitle = pageTitle
    ? `${pageTitle} | ${brandName}`
    : brandName;

  const finalDescription =
    description ||
    import.meta.env.VITE_SEO_DESCRIPTION ||
    "Premium DJ remixes and original productions.";

  const siteUrl =
    import.meta.env.VITE_SITE_URL || globalThis.location.origin;

  const finalCanonical = canonicalUrl || siteUrl;

  const finalOgImage =
    ogImage ||
    import.meta.env.VITE_OG_IMAGE_URL ||
    settings?.logoUrl ||
    `${siteUrl}/preview.jpg`;

  /* -----------------------------
     SOCIAL / JSON-LD
  ----------------------------- */

  const social = settings?.socialLinks || {};
  const sameAs = [
    social.facebook,
    social.instagram,
    social.twitter,
    social.youtube,
    social.tiktok,
    social.soundcloud,
    social.spotify,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: brandName,
    url: siteUrl,
    description: finalDescription,
    image: finalOgImage,
    sameAs,
  };

  return (
    <Helmet>
      {/* BASIC */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonical} />

      {/* OPEN GRAPH */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalOgImage} />

      {/* TWITTER */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
