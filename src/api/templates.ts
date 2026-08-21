import { assetUrl, request } from "./http";

/**
 * The website templates a client can be built on. The marketing site shows
 * these so a prospect can browse the real thing before asking for a quote.
 */
export type SiteTemplate = {
  code: string;
  category: "SHOP" | "RESTAURANT" | string;
  tier: "SIMPLE" | "CLASSIC" | "MODERN" | string;
  name: string;
  tagline: string;
  description: string;
  /** Wireframe thumbnail rendered by the backend. */
  previewUrl: string;
  /** Slug of a live demo site, or null when none is published. */
  demoSlug: string | null;
  flagship: boolean;
};

export function fetchTemplates(): Promise<SiteTemplate[]> {
  return request<SiteTemplate[]>("/templates");
}

/** Absolute URL for a template's thumbnail, which the API returns as a path. */
export function templateThumbnail(template: SiteTemplate): string {
  return assetUrl(template.previewUrl);
}
