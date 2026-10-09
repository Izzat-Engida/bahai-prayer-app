import ReminderForm from '@/components/ui/ReminderForm';
import ReminderList from '@/components/ui/ReminderList';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from '@/constants/theme';
import { useFontSize } from '@/hooks/useFontSize';

import {useReminders} from '@/hooks/useReminders';
const Reminder = () => {
  const {add,reminders,remove}= useReminders()
  const { scaledSize } = useFontSize();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.eyebrowRow}>
            <View style={styles.goldLine} />
            <Text style={styles.eyebrow}>A MOMENT TO PAUSE</Text>
            <View style={styles.goldLine} />
          </View>
          <Text style={[styles.heading, { fontSize: scaledSize(26) }]}>Reminders</Text>
          <Text style={styles.description}>
            Set a daily moment for prayer, reflection, or quiet study.
          </Text>
        </View>

        <ReminderForm onAdd={add}>
          <ReminderList reminders={reminders} onDelete={remove}/>
        </ReminderForm>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  intro: {
    paddingTop: 16,
    paddingBottom: 18,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goldLine: {
    height: 1,
    width: 25,
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.secondary,
  },
  heading: {
    fontFamily: fonts.heading,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
});

export default Reminder
