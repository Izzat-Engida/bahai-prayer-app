import {useMemo} from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json'
import type {PrayerJsonFormat,PrayerRaw} from "../types/prayer.types";

const data=prayers as PrayerJsonFormat;

export function usePrayersByTag(tagId:number|null){
return useMemo<PrayerRaw[]>(()=>{
    if(tagId===null) return [];

    return data.Prayers.filter((prayer)=>prayer.Tags.some((tag)=>tag.Id===tagId))
},[tagId])
}