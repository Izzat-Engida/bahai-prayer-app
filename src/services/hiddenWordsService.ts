import rawHiddens from "../../assets/data/HiddensByLanguage.json";
import type { HiddenWord } from "../types/hiddenword.types";
import type { PrayerRaw } from "../types/prayer.types";

export const HIDDEN_WORDS_CATEGORY_ID = 8888;
export const HIDDEN_WORDS_ARABIC_ID = 8889;
export const HIDDEN_WORDS_PERSIAN_ID = 8890;

const hiddensData = rawHiddens as HiddenWord[];


export function selectHiddenWordUrl(hw: HiddenWord): string | null {
  if (hw.Url1 && hw.Url1.trim().length > 0) {
    return hw.Url1.trim();
  }
  if (hw.Url2 && hw.Url2.trim().length > 0) {
    return hw.Url2.trim();
  }
  return null;
}

export function getHiddenWords(group: "ALL" | "ARABIC" | "PERSIAN" = "ALL"): HiddenWord[] {
  if (group === "ARABIC") {
    return hiddensData.filter((hw) => hw.IsArabic);
  }
  if (group === "PERSIAN") {
    return hiddensData.filter((hw) => !hw.IsArabic);
  }
  return hiddensData;
}

export function getHiddenWordById(id: number): HiddenWord | null {
  return hiddensData.find((hw) => hw.Id === id) ?? null;
}

export function isHiddenWordId(id: number | null | undefined): boolean {
  if (id == null) return false;
  return hiddensData.some((hw) => hw.Id === id);
}

export function convertHiddenWordToPrayerRaw(hw: HiddenWord): PrayerRaw {
  const primaryUrl = selectHiddenWordUrl(hw);
  const tagId = hw.IsArabic ? HIDDEN_WORDS_ARABIC_ID : HIDDEN_WORDS_PERSIAN_ID;
  const tagName = hw.IsArabic ? `Arabic Hidden Words #${hw.Number}` : `Persian Hidden Words #${hw.Number}`;
  const categoryName = hw.IsArabic ? "Arabic Hidden Words" : "Persian Hidden Words";

  return {
    Id: hw.Id,
    AuthorId: 2, 
    LanguageId: hw.LanguageId,
    Text: hw.Text,
    Tags: [
      {
        Id: HIDDEN_WORDS_CATEGORY_ID,
        Name: "The Hidden Words",
        Kind: "HIDDEN_WORDS",
      },
      {
        Id: tagId,
        Name: categoryName,
        Kind: "HIDDEN_WORDS",
      },
    ],
    FirstTagName: tagName,
    TagKind: {
      Kind: "HIDDEN_WORDS",
    },
    Urls: primaryUrl
      ? [
          {
            Url: primaryUrl,
            Title: `Hidden Word #${hw.Number} Audio`,
            isYouTube: true,
          },
        ]
      : [],
  };
}

export function getAllHiddenWordsAsPrayers(): PrayerRaw[] {
  return hiddensData.map(convertHiddenWordToPrayerRaw);
}
