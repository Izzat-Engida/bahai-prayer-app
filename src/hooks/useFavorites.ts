import { useState, useCallback, useMemo } from "react";
import prayers from "../../assets/data/prayersystembylanguage.json";
import type { PrayerJsonFormat, PrayerRaw } from "../types/prayer.types";
import { getFavoriteIds, toggleFavorite as dbToggleFavorite } from "../services/database";

const data = prayers as PrayerJsonFormat;

export function useFavorites() {
  const [favIds, setFavIds] = useState<number[]>(() => getFavoriteIds());

  const refreshFavorites = useCallback(() => {
    setFavIds(getFavoriteIds());
  }, []);

  const toggleFav = useCallback((prayerId: number) => {
    const isNowFav = dbToggleFavorite(prayerId);
    setFavIds(getFavoriteIds());
    return isNowFav;
  }, []);

  const favoritePrayers = useMemo<PrayerRaw[]>(() => {
    const map = new Map<number, PrayerRaw>();
    data.Prayers.forEach((p) => map.set(p.Id, p));

    return favIds.map((id) => map.get(id)).filter(Boolean) as PrayerRaw[];
  }, [favIds]);

  return {
    favIds,
    favoritePrayers,
    refreshFavorites,
    toggleFav,
  };
}
