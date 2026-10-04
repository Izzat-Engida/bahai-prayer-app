
export interface HiddenWord {
  Id: number;
  Number: number;
  LanguageId: number;
  IsArabic: boolean;
  Url1?: string | null;
  Url2?: string | null;
  Text: string;
}

export interface HiddenWords {
  HiddenWords: HiddenWord[];
}