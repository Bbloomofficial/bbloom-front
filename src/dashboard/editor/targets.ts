import { API_BASE } from "../../api/http";
import type { FieldSchema, SectionDto, SiteLanguage } from "../api/types";
import type { HotspotTarget } from "../../site/editing/hotspots";
import { mediaIdOf } from "./pending";

/**
 * What the preview can be asked to point at.
 *
 * The section schemas already describe every editable value, so the hotspot
 * targets are derived from them rather than maintained separately — a template
 * that gains a field gains a hotspot with no work here. The id is the section
 * key and the field path joined, which is exactly what the panel needs to
 * select the section and focus the input.
 */

const SEP = "::";

export function splitTargetId(id: string) {
  const at = id.indexOf(SEP);
  if (at < 0) return null;
  return { sectionKey: id.slice(0, at), path: id.slice(at + SEP.length) };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textOf(value: unknown, localized: boolean, lang: SiteLanguage) {
  const raw = localized ? asRecord(value)[lang] : value;
  return typeof raw === "string" ? raw : null;
}

function walk(
  fields: FieldSchema[],
  content: Record<string, unknown>,
  lang: SiteLanguage,
  prefix: string,
  into: HotspotTarget[],
) {
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.key}` : field.key;
    const value = content[field.key];

    if (field.type === "list") {
      const items = Array.isArray(value) ? value : [];
      items.forEach((item, index) => {
        walk(
          field.itemFields ?? [],
          asRecord(item),
          lang,
          `${path}.${index}`,
          into,
        );
      });
      continue;
    }

    if (field.type === "image") {
      const mediaId = mediaIdOf(value);
      if (mediaId) {
        into.push({
          id: path,
          kind: "image",
          value: `${API_BASE}/media/${mediaId}`,
        });
      }
      continue;
    }

    if (field.type === "text" || field.type === "textarea") {
      const text = textOf(value, !!field.localized, lang);
      if (text && text.trim()) into.push({ id: path, kind: "text", value: text });
    }
  }
}

export function sectionTargets(
  sections: SectionDto[],
  lang: SiteLanguage,
): HotspotTarget[] {
  const targets: HotspotTarget[] = [];
  for (const section of sections) {
    if (!section.visible) continue;
    const own: HotspotTarget[] = [];
    walk(section.fields ?? [], asRecord(section.content), lang, "", own);
    for (const target of own) {
      targets.push({ ...target, id: `${section.key}${SEP}${target.id}` });
    }
  }
  return targets;
}
