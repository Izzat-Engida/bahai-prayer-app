import { useMemo } from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json';
import type { PrayerJsonFormat, PrayerRaw } from "../types/prayer.types";
import { OBLIGATORY_CATEGORY_ID } from "./usePrayerTags";
import {
  HIDDEN_WORDS_CATEGORY_ID,
  HIDDEN_WORDS_ARABIC_ID,
  HIDDEN_WORDS_PERSIAN_ID,
  getAllHiddenWordsAsPrayers,
  getHiddenWords,
  convertHiddenWordToPrayerRaw,
} from "../services/hiddenWordsService";

const data = prayers as PrayerJsonFormat;

const OBLIGATORY_TAG_IDS = [101, 102, 104, OBLIGATORY_CATEGORY_ID];

export function usePrayersByTag(tagId: number | null) {
  return useMemo<PrayerRaw[]>(() => {
    if (tagId === null) return [];

    if (tagId === HIDDEN_WORDS_CATEGORY_ID) {
      return getAllHiddenWordsAsPrayers();
    }
    if (tagId === HIDDEN_WORDS_ARABIC_ID) {
      return getHiddenWords("ARABIC").map(convertHiddenWordToPrayerRaw);
    }
    if (tagId === HIDDEN_WORDS_PERSIAN_ID) {
      return getHiddenWords("PERSIAN").map(convertHiddenWordToPrayerRaw);
    }

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