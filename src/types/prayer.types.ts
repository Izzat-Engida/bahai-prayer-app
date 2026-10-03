
export interface TagRaw{
Id:number;
LanguageId:number;
Name:string;
Kind:string;
PrayerCount:number;
}
export interface PrayerTagRaw{
Id:number;
Name:string;
Kind:string;
}
export interface PrayerUrlRaw{
    Url:string;
    Title:string;
    isYouTube:boolean;
}
export interface PrayerRaw{
Id:number;
AuthorId:number;
LanguageId:number;
Text:string;
Tags:PrayerTagRaw[];
FirstTagName:string;
TagKind:{
    Kind:string
},
Urls:PrayerUrlRaw[]
}
export interface TagRelationsRaw{
Id:number;
PrayerId:number;
PrayerTagId:number;
LanguageId:number;
}
export interface LanguageRaw{
    Id:number;
    Name:string;
    English:"string";
    IsLeftToRight:true;
    FlagLink:string;
}
export interface UrlRaw{
    Id:number;
    PrayerId:number;
    Title:string;
    Link:string;
    LanguageId:number;
}

export interface PrayerJsonFormat{
   ErrorMessage:string;
   IsInError:boolean;
   Version:number;
   Prayers:PrayerRaw[];
   Tags:TagRaw[];
   TagRelations:TagRelationsRaw[];
   Urls:UrlRaw[];
   Languages:LanguageRaw[];
}