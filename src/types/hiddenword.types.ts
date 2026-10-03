
export interface HiddenWord{
    Id:number;
    Number:number;
    LanguageId:1;
    isArabic:boolean;
    Url1:string;
    Url2:string;
    Text:string;
}
export interface HiddenWords{
    HiddenWords:HiddenWord[];
}