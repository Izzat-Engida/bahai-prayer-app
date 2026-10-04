import { useMemo } from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json';
import type { PrayerJsonFormat, PrayerRaw } from "../types/prayer.types";
import { OBLIGATORY_CATEGORY_ID } from "./usePrayerTags";

const data = prayers as PrayerJsonFormat;

const OBLIGATORY_TAG_IDS = [101, 102, 104, OBLIGATORY_CATEGORY_ID];

export function usePrayersByTag(tagId: number | null) {
  return useMemo<PrayerRaw[]>(() => {
    if (tagId === null) return [];

    if (OBLIGATORY_TAG_IDS.includes(tagId)) {
      const obligs = data.Prayers.filter((prayer) =>
        prayer.Tags.some(
          (tag) =>
            tag.Kind === "OBLIGATORY" || OBLIGATORY_TAG_IDS.includes(tag.Id)
        )
      );
      // Sort in traditional order: Short (391) -> Medium (392) -> Long (393)
      return obligs.sort((a, b) => a.Id - b.Id);
    }

    return data.Prayers.filter((prayer) =>
      prayer.Tags.some((tag) => tag.Id === tagId)
    );
  }, [tagId]);
}