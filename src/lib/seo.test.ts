import { describe, it, expect } from "vitest";
import {
  SITE,
  buildSeoProps,
  buildJsonLd,
  swapLocaleUrl,
  type Lang,
} from "./seo";

describe("swapLocaleUrl", () => {
  it("swaps /es/foo/ ↔ /en/foo/", () => {
    expect(swapLocaleUrl("/es/blog/", "en")).toBe("/en/blog/");
    expect(swapLocaleUrl("/en/projects/k8s-management/", "es")).toBe(
      "/es/projects/k8s-management/",
    );
  });

  it("maps root / to /es/ and /en/", () => {
    expect(swapLocaleUrl("/", "es")).toBe("/es/");
    expect(swapLocaleUrl("/", "en")).toBe("/en/");
  });

  it("handles missing locale prefix by injecting target", () => {
    expect(swapLocaleUrl("/foo/", "es")).toBe("/es/foo/");
    expect(swapLocaleUrl("/foo/bar/", "en")).toBe("/en/foo/bar/");
  });

  it("strips query string and hash before swap", () => {
    expect(swapLocaleUrl("/es/blog/?q=foo", "en")).toBe("/en/blog/");
    expect(swapLocaleUrl("/en/blog/#top", "es")).toBe("/es/blog/");
  });

  it("preserves absence of trailing slash on nested paths", () => {
    // swap is path-preserving; trailing slashes are added by the caller via withTrailingSlash
    expect(swapLocaleUrl("/es/projects/k8s-management", "en")).toBe(
      "/en/projects/k8s-management",
    );
    expect(swapLocaleUrl("/es/projects/k8s-management/", "en")).toBe(
      "/en/projects/k8s-management/",
    );
  });
});

describe("buildSeoProps", () => {
  it("returns Spanish locale for /es/ context", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/" });
    expect(seo.ogLocale).toBe("es_MX");
    expect(seo.ogTitle).toContain(SITE.name);
    expect(seo.ogDescription.length).toBeGreaterThanOrEqual(50);
  });

  it("returns English locale for /en/ context", () => {
    const seo = buildSeoProps({}, { lang: "en", path: "/en/" });
    expect(seo.ogLocale).toBe("en_US");
  });

  it("uses Spanish tagline as fallback description when none provided", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/" });
    // Description includes Spanish accent-safe copy
    expect(seo.ogDescription).toBe(SITE.description.es);
    expect(seo.ogDescription.length).toBeGreaterThan(120);
  });

  it("uses caller-provided description and title suffix", () => {
    const seo = buildSeoProps(
      { titleSuffix: "Projects", description: "Custom description here." },
      { lang: "es", path: "/es/projects/" },
    );
    expect(seo.ogTitle).toBe(`${SITE.name} | Projects`);
    expect(seo.ogDescription).toBe("Custom description here.");
  });

  it("falls back to default OG image when none provided", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/" });
    expect(seo.ogImage).toBe("https://daryl.sh/og/es/default.png");
  });

  it("honors custom OG image path", () => {
    const seo = buildSeoProps(
      { image: "/og/custom.png" },
      { lang: "en", path: "/en/" },
    );
    expect(seo.ogImage).toBe("https://daryl.sh/og/custom.png");
  });

  it("constructs og:url from canonical path with trailing slash", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/blog" });
    expect(seo.ogUrl).toBe("https://daryl.sh/es/blog/");
  });

  it("emits 3 hreflang alternates (es, en, x-default)", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/blog/" });
    const langs = seo.hreflang.map((h) => h.lang).sort();
    expect(langs).toEqual(["en", "es", "x-default"]);
  });

  it("points hreflang to swapped URLs", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/projects/k8s-management/" });
    const es = seo.hreflang.find((h) => h.lang === "es")!;
    const en = seo.hreflang.find((h) => h.lang === "en")!;
    expect(es.href).toBe("https://daryl.sh/es/projects/k8s-management/");
    expect(en.href).toBe("https://daryl.sh/en/projects/k8s-management/");
  });

  it("emits twitter:card=summary_large_image", () => {
    const seo = buildSeoProps({}, { lang: "es", path: "/es/" });
    expect(seo.twitterCard).toBe("summary_large_image");
    expect(seo.twitterSite).toBe(`@${SITE.twitter}`);
    expect(seo.twitterCreator).toBe(`@${SITE.twitter}`);
  });
});

describe("buildJsonLd", () => {
  const baseCtx = {
    title: "Test",
    description: "Test description.",
    path: "/es/blog/",
    lang: "es" as Lang,
    type: "website",
  };

  it("includes a Person schema with required fields", () => {
    const json = buildJsonLd(baseCtx, {}) as { "@graph": Array<Record<string, unknown>> };
    const person = json["@graph"].find((n) => n["@type"] === "Person") as Record<string, unknown>;
    expect(person.name).toBe(SITE.name);
    expect(person.jobTitle).toBeDefined();
    expect(person.url).toBe(SITE.siteUrl);
    expect(person.knowsAbout as string[]).toEqual(expect.arrayContaining([...SITE.knowsAbout]));
    expect(person.sameAs).toEqual(expect.arrayContaining([SITE.github, SITE.linkedin]));
  });

  it("includes a WebSite schema with inLanguage", () => {
    const json = buildJsonLd({ ...baseCtx, lang: "es" }, {}) as { "@graph": Array<Record<string, unknown>> };
    const site = json["@graph"].find((n) => n["@type"] === "WebSite")!;
    expect(site.inLanguage).toBe("es-MX");
    expect(site.url).toBe(SITE.siteUrl);
  });

  it("includes a BreadcrumbList for deep paths (≥2 segments)", () => {
    const json = buildJsonLd(
      { ...baseCtx, path: "/es/projects/k8s-management/" },
      {},
    ) as { "@graph": Array<Record<string, unknown>> };
    const bc = json["@graph"].find((n) => n["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    const items = (bc!.itemListElement as Array<Record<string, unknown>>);
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0].position).toBe(1);
    expect(items[items.length - 1].item).toBe(
      "https://daryl.sh/es/projects/k8s-management/",
    );
  });

  it("omits BreadcrumbList for shallow paths", () => {
    const json = buildJsonLd({ ...baseCtx, path: "/es/" }, {}) as { "@graph": Array<Record<string, unknown>> };
    const bc = json["@graph"].find((n) => n["@type"] === "BreadcrumbList");
    expect(bc).toBeUndefined();
  });

  it("includes an Article schema when type=article", () => {
    const json = buildJsonLd(
      {
        ...baseCtx,
        type: "article",
        path: "/es/blog/intro-terraform/",
        publishedTime: "2026-01-01",
      },
      { tags: ["terraform", "kubernetes"] },
    ) as { "@graph": Array<Record<string, unknown>> };
    const article = json["@graph"].find((n) => n["@type"] === "Article");
    expect(article).toBeDefined();
    expect(article!.datePublished).toBe("2026-01-01");
    expect(article!.keywords).toBe("terraform, kubernetes");
    expect(article!.inLanguage).toBe("es-MX");
  });

  it("uses English locale variants when lang=en", () => {
    const json = buildJsonLd(
      { ...baseCtx, lang: "en", type: "article", publishedTime: "2026-01-01" },
      {},
    ) as { "@graph": Array<Record<string, unknown>> };
    const article = json["@graph"].find((n) => n["@type"] === "Article");
    expect(article!.inLanguage).toBe("en-US");
  });

  it("uses schema.org context", () => {
    const json = buildJsonLd(baseCtx, {}) as Record<string, unknown>;
    expect(json["@context"]).toBe("https://schema.org");
  });
});
