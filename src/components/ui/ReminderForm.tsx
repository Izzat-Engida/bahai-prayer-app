import { ReactNode, useState } from 'react';
import { TouchableOpacity, Text, TextInput, AccessibilityInfo, Alert, Platform, StyleSheet, View } from 'react-native';
import DateTimePicker,{DateTimePickerEvent} from '@react-native-community/datetimepicker';
import ReminderCard from './ReminderCard';
import {formatTime} from '@/lib/format'
import { colors, fonts } from '@/constants/theme';

interface Props{
    onAdd:(title:string,hour:number,minute:number)=>Promise<boolean>
    children?: ReactNode;
}

const ReminderForm=({onAdd, children}:Props)=>{
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
            return;
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
        <View style={styles.wrapper}>
          <ReminderCard>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>◷</Text>
              </View>
              <View style={styles.headerCopy}>
                <Text accessibilityRole="header" style={styles.title}>Daily reminder</Text>
                <Text style={styles.subtitle}>Choose a time to return to your practice.</Text>
              </View>
            </View>
            <Text style={styles.label}>REMINDER NAME</Text>
              <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Event name (e.g. Morning prayer)"
        placeholderTextColor="#888"
        accessibilityLabel="Event name"
        returnKeyType="done"
        style={styles.input}
      />
        <Text style={styles.label}>TIME</Text>
        <TouchableOpacity
                onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={`Reminder time ${formatTime(time)}. Double tap to change.`}
        style={styles.timeButton}
        >
            <Text style={styles.timeText}>{formatTime(time)}</Text>
            <Text style={styles.changeText}>Change</Text>
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
      style={[styles.saveButton, saving && styles.disabledButton]}
    >
        <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save reminder'}</Text>
    </TouchableOpacity>
          </ReminderCard>
          {children}
        </View>
    )
}
const styles = StyleSheet.create({
  wrapper: { gap: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#F0E8D8',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  icon: { color: colors.secondary, fontSize: 28, lineHeight: 30 },
  headerCopy: { flex: 1 },
  title: { fontFamily: fonts.heading, color: colors.primary, fontSize: 19, marginBottom: 3 },
  subtitle: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, color: colors.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  input: {
    minHeight: 54, borderRadius: 12, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
    fontFamily: fonts.body, fontSize: 16, color: colors.text, marginBottom: 18,
  },
  timeButton: {
    minHeight: 54, borderRadius: 12, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22,
  },
  timeText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  changeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.secondary },
  saveButton: {
    minHeight: 52, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  disabledButton: { opacity: 0.55 },
  saveText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.surface },
});
export default ReminderForm;
