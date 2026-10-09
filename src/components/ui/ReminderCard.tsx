import { View, ViewProps } from 'react-native'

import { colors, fonts } from "../../constants/theme";
const ReminderCard = ({className='',...rest}:ViewProps & {className?:string}) => {
  return (
    <View
    className={`rounded-2xl bg-secondary p-5 ${className} `}
    {...rest}
    />
      
    
  )
}

export default ReminderCard