import ReminderForm from '@/components/ui/ReminderForm';
import ReminderList from '@/components/ui/ReminderList';
import {ScrollView } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";

import {useReminders} from '@/hooks/useReminders';
const Reminder = () => {
  const {add,reminders,remove}= useReminders()
  return (
     <SafeAreaView
    edges={['left','right']}
    className="flex-1 bg-neutral p-6"
    >
      <ScrollView contentContainerClassName="p-6 gap-6" keyboardShouldPersistTaps="handled">
        <ReminderForm onAdd={add}>
          <ReminderList reminders={reminders} onDelete={remove}/>
        </ReminderForm>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Reminder