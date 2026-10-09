import {useCallback,useEffect,useState} from 'react';
import {
Reminder as ReminderItem,
cancelReminder,
ensurePermission,
listReminders,
scheduleDaily
} from '@/lib/reminders';
export function useReminders(){
const [reminders,setReminders]=useState<ReminderItem[]>([]);

const refresh=useCallback(async ()=> setReminders(await listReminders()),[]);
useEffect(()=>{
refresh();
},[refresh])

const add=useCallback(
    async(title:string,hour:number,minute:number)=>{
        if(!(await ensurePermission())) return false;
        await scheduleDaily(title,hour,minute);
        await refresh()
        return true;
    },
    [refresh]
)
const remove=useCallback(
    async(id:string)=>{
        await cancelReminder(id);
        await refresh();
    },
    [refresh]
)
return {reminders,add,remove}
}