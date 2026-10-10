import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

Notifications.setNotificationHandler({
    handleNotification:async ()=>({
        shouldShowBanner:true,
        shouldShowList:true,
        shouldPlaySound:true,
        shouldSetBadge:false
    })
})
const CHANNEL_ID='reminders';

export type Reminder={id:string;title:string;hour:number;minute:number};

export async function ensurePermission():Promise<boolean>{
    if(Platform.OS==='android'){
        await Notifications.setNotificationChannelAsync(CHANNEL_ID,{
            name:'Daily reminders',
            importance:Notifications.AndroidImportance.HIGH,
            sound:'default'
        })
    }
    const current=await Notifications.getPermissionsAsync();
    if(current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        return true;
    }

    const asked= await Notifications.requestPermissionsAsync({
        ios:{allowAlert:true,allowBadge:true,allowSound:true}
    });
    return asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export function scheduleDaily(title:string,hour:number,minute:number){
    return Notifications.scheduleNotificationAsync({
        content:{
            title,
            body:'Time for your reminder',
            sound:true,
            data:{kind:'daily-reminder',hour,minute}
        },
        trigger:{
            type:Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId:CHANNEL_ID
        }
    })
}

export async function listReminders():Promise<Reminder[]>{
    const all=await Notifications.getAllScheduledNotificationsAsync();

    return all 
        .filter((n)=>n.content.data?.kind==='daily-reminder').map((n)=>({
            id:n.identifier,
            title:n.content.title ?? ' ',
            hour:Number(n.content.data?.hour),
            minute:Number(n.content.data?.minute)
        })).sort((a,b)=>a.hour*60+a.minute -(b.hour*60+b.minute))
}

export const cancelReminder=(id:string)=>Notifications.cancelScheduledNotificationAsync(id);
