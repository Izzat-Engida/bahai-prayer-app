import { useState, useCallback, useMemo } from "react";
import prayers from "../../assets/data/prayersystembylanguage.json";
import type { PrayerJsonFormat, PrayerRaw } from "../types/prayer.types";
import { getHistoryRecords, recordHistory as dbRecordHistory, HistoryRecord } from "../services/database";

const data = prayers as PrayerJsonFormat;

export interface HistorySection {
  title: "Today" | "This week" | "Earlier";
  data: PrayerRaw[];
}

export function useHistory() {
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() =>
    getHistoryRecords()
  );

  const refreshHistory = useCallback(() => {
    setHistoryRecords(getHistoryRecords());
  }, []);

  const addHistoryEntry = useCallback((prayerId: number) => {
    dbRecordHistory(prayerId);
    setHistoryRecords(getHistoryRecords());
  }, []);

  const historySections = useMemo<HistorySection[]>(() => {
    if (historyRecords.length === 0) return [];

    const map = new Map<number, PrayerRaw>();
    data.Prayers.forEach((p) => map.set(p.Id, p));

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;

    const todayPrayers: PrayerRaw[] = [];
    const thisWeekPrayers: PrayerRaw[] = [];
    const earlierPrayers: PrayerRaw[] = [];

    historyRecords.forEach((rec) => {
      const prayer = map.get(rec.prayerId);
      if (!prayer) return;

      if (rec.viewedAt >= startOfToday) {
        todayPrayers.push(prayer);
      } else if (rec.viewedAt >= sevenDaysAgo) {
        thisWeekPrayers.push(prayer);
      } else {
        earlierPrayers.push(prayer);
      }
    });

    const sections: HistorySection[] = [];
    if (todayPrayers.length > 0) {
      sections.push({ title: "Today", data: todayPrayers });
    }
    if (thisWeekPrayers.length > 0) {
      sections.push({ title: "This week", data: thisWeekPrayers });
    }
    if (earlierPrayers.length > 0) {
      sections.push({ title: "Earlier", data: earlierPrayers });
    }

    return sections;
  }, [historyRecords]);

  const allHistoryPrayers = useMemo<PrayerRaw[]>(() => {
    const map = new Map<number, PrayerRaw>();
    data.Prayers.forEach((p) => map.set(p.Id, p));
    return historyRecords.map((r) => map.get(r.prayerId)).filter(Boolean) as PrayerRaw[];
  }, [historyRecords]);

  return {
    historyRecords,
    historySections,
    allHistoryPrayers,
    refreshHistory,
    addHistoryEntry,
  };
}
