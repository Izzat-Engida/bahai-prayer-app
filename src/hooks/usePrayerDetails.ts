import {useMemo} from 'react';
import prayers from '../../assets/data/prayersystembylanguage.json'
import type {PrayerJsonFormat,PrayerRaw} from "../types/prayer.types";


const data=prayers as PrayerJsonFormat;

export function usePrayerDetails(prayerId:number|null){
    return useMemo<PrayerRaw|null>(()=>{
        if(prayerId===null) return null;
        return (
            data.Prayers.find((prayer)=>prayer.Id===prayerId)??null
        )
    },[prayerId])
}