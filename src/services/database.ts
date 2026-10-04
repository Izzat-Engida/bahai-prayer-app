import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("bahai_prayers.db");
    dbInstance.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS favorites (
        prayer_id INTEGER PRIMARY KEY,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS history (
        prayer_id INTEGER PRIMARY KEY,
        viewed_at INTEGER NOT NULL
      );
    `);
  }
  return dbInstance;
}


export function getFavoriteIds(): number[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<{ prayer_id: number }>(
      "SELECT prayer_id FROM favorites ORDER BY created_at DESC"
    );
    return rows.map((r) => r.prayer_id);
  } catch (error) {
    console.error("Error fetching favorite IDs:", error);
    return [];
  }
}


export function isFavorite(prayerId: number): boolean {
  try {
    const db = getDb();
    const row = db.getFirstSync<{ prayer_id: number }>(
      "SELECT prayer_id FROM favorites WHERE prayer_id = ?",
      [prayerId]
    );
    return !!row;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}


export function toggleFavorite(prayerId: number): boolean {
  try {
    const db = getDb();
    const currentlyFav = isFavorite(prayerId);
    if (currentlyFav) {
      db.runSync("DELETE FROM favorites WHERE prayer_id = ?", [prayerId]);
      return false;
    } else {
      db.runSync(
        "INSERT OR REPLACE INTO favorites (prayer_id, created_at) VALUES (?, ?)",
        [prayerId, Date.now()]
      );
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }
}


export function recordHistory(prayerId: number) {
  try {
    const db = getDb();
    const now = Date.now();
    db.runSync(
      "INSERT OR REPLACE INTO history (prayer_id, viewed_at) VALUES (?, ?)",
      [prayerId, now]
    );
    
    db.runSync(
      `DELETE FROM history WHERE prayer_id NOT IN (
        SELECT prayer_id FROM history ORDER BY viewed_at DESC LIMIT 10
      )`
    );
  } catch (error) {
    console.error("Error recording history:", error);
  }
}

export interface HistoryRecord {
  prayerId: number;
  viewedAt: number;
}


export function getHistoryRecords(): HistoryRecord[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<{ prayer_id: number; viewed_at: number }>(
      "SELECT prayer_id, viewed_at FROM history ORDER BY viewed_at DESC LIMIT 10"
    );
    return rows.map((r) => ({
      prayerId: r.prayer_id,
      viewedAt: r.viewed_at,
    }));
  } catch (error) {
    console.error("Error fetching history records:", error);
    return [];
  }
}
