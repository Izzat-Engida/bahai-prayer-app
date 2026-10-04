import { useMemo } from "react";
import prayers from "../../assets/data/prayersystembylanguage.json";
import type { PrayerJsonFormat, PrayerRaw } from "../types/prayer.types";

const data = prayers as PrayerJsonFormat;

export function usePrayerDetails(prayerId: number | null) {
  return useMemo<PrayerRaw | null>(() => {
    if (prayerId === null) return null;
    const prayer = data.Prayers.find((p) => p.Id === prayerId) ?? null;
    if (!prayer) return null;

    // Merge root data.Urls for this prayerId with prayer.Urls
    const rootUrls = (data.Urls || [])
      .filter((u) => u.PrayerId === prayerId)
      .map((u) => ({
        Url: u.Link,
        Title: u.Title,
        isYouTube: true,
      }));

    const existingUrls = prayer.Urls || [];
    const mergedUrls = [...existingUrls];
    for (const ru of rootUrls) {
      if (!mergedUrls.some((e) => e.Url === ru.Url)) {
        mergedUrls.push(ru);
      }
    }

    return {
      ...prayer,
      Urls: mergedUrls,
    };
  }, [prayerId]);
}