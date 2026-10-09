import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import ReminderCard from './ReminderCard';
import {Reminder} from '@/lib/reminders';
import {formatHour} from '@/lib/format';
import { colors, fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ReminderProp{
    reminders:Reminder[],
    onDelete:(id:string)=>void;
}
const ReminderList = ({reminders,onDelete}:ReminderProp) => {
    if (reminders.length===0){
        return(
            <ReminderCard>
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={28} color={colors.secondary} />
                  <Text style={styles.emptyTitle}>No reminders yet</Text>
                  <Text style={styles.emptyDescription}>Your saved daily reminders will appear here.</Text>
                </View>
            </ReminderCard>
        )
    }
  return (
    <View className="gap-3">
      <Text style={styles.sectionTitle}>YOUR DAILY REMINDERS</Text>
        {
         reminders.map((reminder)=>(
            <ReminderCard key={reminder.id} style={styles.reminderCard}>
                <View
                className="flex-1 pr-3"
                accessible
                accessibilityLabel={`${reminder.title}, every day at ${formatHour(reminder.hour,reminder.minute)}`}
                >
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderMeta}>
                        Every day  ·  {formatHour(reminder.hour,reminder.minute)}
                    </Text>
                </View>
                <TouchableOpacity
                onPress={()=>onDelete(reminder.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete reminder ${reminder.title}`}
                style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={19} color={colors.tertiary} />
                </TouchableOpacity>
            </ReminderCard>
         ))
        }
    </View>
  )
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', paddingVertical: 8 },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary, marginTop: 12, marginBottom: 5 },
  emptyDescription: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center' },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.5, color: colors.muted, marginBottom: 10 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  reminderTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.primary, marginBottom: 5 },
  reminderMeta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  deleteButton: {
    minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: '#F8EDEA',
  },
});

export default ReminderList
