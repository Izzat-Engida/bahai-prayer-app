import { View, Text ,TouchableOpacity} from 'react-native'
import ReminderCard from './ReminderCard';
import {Reminder} from '@/lib/reminders';
import {formatHour} from '@/lib/format';

interface ReminderProp{
    reminders:Reminder[],
    onDelete:(id:string)=>void;
}
const ReminderList = ({reminders,onDelete}:ReminderProp) => {
    if (reminders.length===0){
        return(
            <ReminderCard>
                <Text>edit the ui here</Text>
            </ReminderCard>
        )
    }
  return (
    <View className="gap-3">
      <Text>ReminderList ui edit here </Text>
        {
         reminders.map((reminder)=>(
            <ReminderCard key={reminder.id} className='flex-row items-center justify-between p-4'>
                <View
                className="flex-1 pr-3"
                accessible
                accessibilityLabel={`${reminder.title}, every day at ${formatHour(reminder.hour,reminder.minute)}`}
                >
                    <Text>{reminder.title}</Text>
                    <Text>
                        Every Day . {formatHour(reminder.hour,reminder.minute)}
                    </Text>
                </View>
                <TouchableOpacity
                onPress={()=>onDelete(reminder.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete reminder ${reminder.title}`}
                className="min-h-[48px] min-w-[48px] items center justify-center rounded-2xl bg-red-600 px-4"
                >
                    <Text className=''>Delete ui here too</Text>
                </TouchableOpacity>
            </ReminderCard>
         ))
        }
    </View>
  )
}

export default ReminderList