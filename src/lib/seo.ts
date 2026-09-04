/**
 * SEO helper module for daryl.sh portfolio.
 *
 * Centralizes construction of Open Graph, Twitter Card, hreflang,
 * JSON-LD, and unique meta descriptions for all pages.
 *
 * @module lib/seo
 */

/** Site-wide constants — single source of truth for OG/JSON-LD identity. */
export const SITE = {
  name: "Daryl Mendoza",
  shortName: "Daryl Mendoza",
  author: "Daryl Mendoza",
  jobTitle: {
    es: "Ingeniero DevOps / SRE",
    en: "DevOps / SRE Engineer",
  },
  tagline: {
    es: "Ingeniero DevOps / SRE en CDMX · AWS, GCP, Kubernetes, Terraform, CI/CD, GitHub Actions",
    en: "DevOps / SRE Engineer in Mexico City · AWS, GCP, Kubernetes, Terraform, CI/CD, GitHub Actions",
  },
  description: {
    es: "Portafolio de Daryl Mendoza, ingeniero DevOps/SRE en CDMX. AWS, GCP, Kubernetes, Terraform, CI/CD y GitHub Actions. Mis proyectos y experiencia.",
    en: "Daryl Mendoza's DevOps/SRE portfolio from Mexico City. AWS, GCP, Kubernetes, Terraform, CI/CD pipelines, and GitHub Actions expertise.",
  },
  siteUrl: "https://daryl.sh",
  locale: { es: "es_MX", en: "en_US" },
  twitter: "darylemb",
  github: "https://github.com/darylemb",
  linkedin: "https://www.linkedin.com/in/darylemb",
  knowsAbout: [
    "Kubernetes",
    "Terraform",
    "AWS",
    "GCP",
    "CI/CD",
    "GitHub Actions",
    "Cloudflare",
    "Docker",
    "Argo CD",
    "Linux",
  ] as string[],
} as const;

export type Lang = "es" | "en";
export type PageType = "website" | "article" | "profile";

export interface SeoProps {
  /** Page title suffix is appended after `SITE.name`. Optional. */
  titleSuffix?: string;
  /** Unique meta description, 120-160 chars. Falls back to `SITE.description[lang]`. */
  description?: string;
  /** Path to OG image, relative to `/`. Defaults to `/og/${lang}/default.png`. */
  image?: string;
  /** Open Graph type. */
  type?: PageType;
  /** ISO 8601 publish time for articles. */
  publishedTime?: string;
  /** ISO 8601 modified time for articles. */
  modifiedTime?: string;
  /** Article tags for Article schema. */
  tags?: string[];
}

export interface SeoContext {
  lang: Lang;
  /** Current pathname including locale prefix, e.g. "/es/blog/". */
  path: string;
}

export interface PrebuiltSeo {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogLocale: string;
  ogSiteName: string;
  twitterCard: "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
  canonical: string;
  hreflang: Array<{ lang: string; href: string }>;
  jsonLd: Record<string, unknown>;
}

/** Default OG image path used when caller does not specify one. */
function defaultOgImage(lang: Lang): string {
  return `/og/${lang}/default.png`;
}

/** Construct an absolute URL from a path or relative URL. */
function absoluteUrl(maybePath: string): string {
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = maybePath.startsWith("/") ? maybePath : `/${maybePath}`;
  return new URL(path, SITE.siteUrl).toString();
}

/**
 * Swap the locale prefix in a pathname, e.g. "/es/blog/" ↔ "/en/blog/".
 * Handles root "/" by mapping to "/es/" or "/en/".
 */
export function swapLocaleUrl(pathname: string, targetLang: Lang): string {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  if (cleanPath === "/" || cleanPath === "") {
    return `/${targetLang}/`;
  }
  const match = cleanPath.match(/^\/(es|en)(\/.*)?$/);
  if (match) {
    const rest = match[2] ?? "/";
    return `/${targetLang}${rest.startsWith("/") ? rest : `/${rest}`}`;
  }
  // Path without locale prefix — treat as default locale and re-target.
  return `/${targetLang}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

/** Path-safe variant of `pathname` (preserves trailing slash for canonical). */
function withTrailingSlash(path: string): string {
  if (path === "/" || path === "") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

/**
 * Build a single, fully precomputed SEO meta payload for embedding in `<head>`.
 * Use this once per page and pass the resulting object to `<Layout seo={seo}>`.
 */
export function buildSeoProps(props: SeoProps, ctx: SeoContext): PrebuiltSeo {
  const lang = ctx.lang;
  const description =
    props.description?.trim() ||
    SITE.description[lang] ||
    SITE.description.es;

  const title = props.titleSuffix
    ? `${SITE.name} | ${props.titleSuffix}`
    : `${SITE.name} | ${SITE.jobTitle[lang]}`;

  const imagePath = props.image?.trim() || defaultOgImage(lang);
  const ogImage = absoluteUrl(imagePath);
  const ogUrl = absoluteUrl(withTrailingSlash(ctx.path));
  const canonical = ogUrl;

  const hreflang: Array<{ lang: string; href: string }> = [
    { lang: "es", href: absoluteUrl(withTrailingSlash(swapLocaleUrl(ctx.path, "es"))) },
    { lang: "en", href: absoluteUrl(withTrailingSlash(swapLocaleUrl(ctx.path, "en"))) },
    { lang: "x-default", href: absoluteUrl(withTrailingSlash(swapLocaleUrl(ctx.path, "es"))) },
  ];

  const ogType = props.type === "article" ? "article" : props.type ?? "website";

  const jsonLd = buildJsonLd(
    {
      title,
      description,
      path: ctx.path,
      lang,
      type: ogType,
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
      tags: props.tags,
    },
    props,
  );

  return {
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl,
    ogType,
    ogLocale: SITE.locale[lang],
    ogSiteName: SITE.name,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterSite: `@${SITE.twitter}`,
    twitterCreator: `@${SITE.twitter}`,
    canonical,
    hreflang,
    jsonLd,
  };
}

/**
 * Build a schema.org @graph payload combining Person, WebSite, and contextual
 * schemas (Article for blog posts, BreadcrumbList for deep paths).
 */
export interface JsonLdContext {
  title: string;
  description: string;
  path: string;
  lang: Lang;
  type: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export function buildJsonLd(
  ctx: JsonLdContext,
  props: SeoProps,
): Record<string, unknown> {
  const graph: Array<Record<string, unknown>> = [];

  // Person — site identity
  graph.push({
    "@type": "Person",
    "@id": `${SITE.siteUrl}/#person`,
    name: SITE.name,
    givenName: "Daryl",
    familyName: "Mendoza",
    jobTitle: SITE.jobTitle[ctx.lang],
    url: SITE.siteUrl,
    image: absoluteUrl("/og/avatar.jpg"),
    sameAs: [SITE.github, SITE.linkedin],
    knowsAbout: SITE.knowsAbout.slice(),
    description: ctx.description,
  });

  // WebSite — site-level
  graph.push({
    "@type": "WebSite",
    "@id": `${SITE.siteUrl}/#website`,
    name: SITE.name,
    url: SITE.siteUrl,
    inLanguage: ctx.lang === "es" ? "es-MX" : "en-US",
    description: SITE.description[ctx.lang],
    publisher: { "@id": `${SITE.siteUrl}/#person` },
  });

  // BreadcrumbList for paths with 2+ segments under a locale
  const cleanedPath = ctx.path.split("?")[0].split("#")[0];
  const segments = cleanedPath.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const itemList = segments.map((segment, index) => {
      const href =
        `${SITE.siteUrl}/${segments.slice(0, index + 1).join("/")}/`;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: humanizeSegment(segment),
        item: href,
      };
    });
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${SITE.siteUrl}${cleanedPath}#breadcrumb`,
      itemListElement: itemList,
    });
  }

  // Article when type === "article" (blog post)
  if (ctx.type === "article") {
    graph.push({
      "@type": "Article",
      "@id": `${SITE.siteUrl}${cleanedPath}#article`,
      headline: ctx.title,
      description: ctx.description,
      inLanguage: ctx.lang === "es" ? "es-MX" : "en-US",
      datePublished: ctx.publishedTime,
      dateModified: ctx.modifiedTime ?? ctx.publishedTime,
      author: { "@id": `${SITE.siteUrl}/#person` },
      publisher: { "@id": `${SITE.siteUrl}/#person` },
      mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(ctx.path) },
      keywords: props.tags?.join(", "),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/** Convert URL segment like "k8s-management" to a human label. */
function humanizeSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
