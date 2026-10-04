import { useMemo } from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json';
import type { PrayerJsonFormat, TagRaw } from "../types/prayer.types";

const data = prayers as PrayerJsonFormat;

export const OBLIGATORY_CATEGORY_ID = 9999;

export function usePrayerTags(kind: string | null) {
  return useMemo<TagRaw[]>(() => {
    if (!kind) return [];

    if (kind === "OBLIGATORY") {
      const obligCount = data.Prayers.filter((p) =>
        p.Tags.some((t) => t.Kind === "OBLIGATORY" || [101, 102, 104].includes(t.Id))
      ).length;

      return [
        {
          Id: OBLIGATORY_CATEGORY_ID,
          LanguageId: 1,
          Name: "Obligatory Prayers",
          Kind: "OBLIGATORY",
          PrayerCount: obligCount || 3,
        },
      ];
    }

    return data.Tags.filter((tag) => tag.Kind === kind);
  }, [kind]);
}