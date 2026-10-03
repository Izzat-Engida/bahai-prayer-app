import {useMemo} from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json'
import type {PrayerJsonFormat} from "../types/prayer.types";

const data=prayers as PrayerJsonFormat;
export function usePrayerKinds(){
    return useMemo(()=>{
        return [...new Set(data.Tags.map((tag=>tag.Kind)))]
    },[])
}