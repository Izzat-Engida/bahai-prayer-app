import {useState} from 'react';
import {TouchableOpacity,Text,TextInput,AccessibilityInfo,Alert,Platform} from 'react-native';
import DateTimePicker,{DateTimePickerEvent} from '@react-native-community/datetimepicker';
import ReminderCard from './ReminderCard';
import {formatTime} from '@/lib/format'

interface Props{
    onAdd:(title:string,hour:number,minute:number)=>Promise<boolean>
}

const ReminderForm=({onAdd}:Props)=>{
    const[name,setName]=useState('');
    const [time,setTime]=useState(()=>new Date(2000,0,1,8,0));
    const [showPicker,setShowPicker]=useState(false);
    const [saving,setSaving]=useState(false);

    const onTimeChange=(e:DateTimePickerEvent,date?:Date)=>{
        if (Platform.OS==='android') setShowPicker(false);
        if(e.type==='set' && date) setTime(date);
    }

    const onSave=async()=>{
        const title=name.trim();

        if(!title){
            Alert.alert('Event name needed','Type a name for this reminder first')
        }
        setSaving(true);
        try {
            const ok=await onAdd(title,time.getHours(),time.getMinutes());
            if(!ok){
                Alert.alert('Notifications are off', 'Allow notifications in your phone settings to get reminders.');
                return;    
            }
            setName('');
                AccessibilityInfo.announceForAccessibility(`Reminder ${title} saved for every day at ${formatTime(time)}`);
        } finally {
            setSaving(false)
        }
    };
    return(
        <ReminderCard className="gap-3">
            <Text accessibilityRole="header">
            Daily Reminder
            </Text>
              <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Event name (e.g. Morning prayer)"
        placeholderTextColor="#888"
        accessibilityLabel="Event name"
        returnKeyType="done"
        className="min-h-[56px] rounded-xl bg-white/80 px-4 text-lg text-black"
      />
        <TouchableOpacity
                onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={`Reminder time ${formatTime(time)}. Double tap to change.`}
        className=''
        >
            <Text>Time: {formatTime(time)}</Text>
        </TouchableOpacity>
              {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    <TouchableOpacity
            onPress={onSave}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Save daily reminder"
        accessibilityState={{ disabled: saving }}
      className=''
    >
        <Text>Save reminder</Text>
    </TouchableOpacity>
        </ReminderCard>
    )
}
export default ReminderForm;