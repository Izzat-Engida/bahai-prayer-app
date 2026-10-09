import { View, ViewProps, StyleSheet } from 'react-native'

import { colors } from "../../constants/theme";
const ReminderCard = ({className='', style, ...rest}:ViewProps & {className?:string}) => {
  return (
    <View
    className={className}
    style={[styles.card, style]}
    {...rest}
    />
      
    
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
});

export default ReminderCard
