import {useMemo} from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json'
import type {PrayerJsonFormat,TagRaw} from "../types/prayer.types";

const data=prayers as PrayerJsonFormat;

export function usePrayerTags(kind:string|null){
    return useMemo<TagRaw[]>(()=>{
        if(!kind) return [];
        return data.Tags.filter((tag)=>tag.Kind===kind)
    },[kind])
}