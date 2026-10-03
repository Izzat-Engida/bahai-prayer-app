import { View, Text } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import {useState} from 'react'
import { Ionicons } from "@expo/vector-icons";

const Prayers = () => {
  const [search,SetSearch]=useState('');
  return (
    <SafeAreaView
    edges={['top','left','right']}
    className="flex-1 bg-neutral p-6"
    >

    </SafeAreaView>
  )
}

export default Prayers