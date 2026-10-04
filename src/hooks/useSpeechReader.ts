import { useState, useCallback, useEffect, useRef } from "react";
import * as Speech from "expo-speech";
import NetInfo from "@react-native-community/netinfo";
import { useAppSelector } from "../store";
import { getSpeechText } from "../utils/textUtils";

export function useSpeechReader() {
  const { useOnlineAudio, readingSpeed } = useAppSelector((state) => state.settings);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePrayerId, setActivePrayerId] = useState<number | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<"online" | "tts">("tts");

  const currentPrayerIdRef = useRef<number | null>(null);
  currentPrayerIdRef.current = activePrayerId;

 
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const stopReading = useCallback(() => {
    Speech.stop();
    setIsPlaying(false);
    setActivePrayerId(null);
  }, []);

  const startReading = useCallback(
    async (prayerId: number, rawHtmlText: string, onlineAudioUrl?: string) => {
    
      await Speech.stop();

     
      const cleanText = getSpeechText(rawHtmlText);
      if (!cleanText) return;

     
      const netState = await NetInfo.fetch();
      const isOnline = !!netState.isConnected && !!netState.isInternetReachable;

      let sourceType: "online" | "tts" = "tts";

      
      if (useOnlineAudio && isOnline && onlineAudioUrl) {
        sourceType = "online";
      }

      setAudioSourceType(sourceType);
      setActivePrayerId(prayerId);
      setIsPlaying(true);

    
      Speech.speak(cleanText, {
        rate: readingSpeed,
        language: "en-US",
        onDone: () => {
          if (currentPrayerIdRef.current === prayerId) {
            setIsPlaying(false);
            setActivePrayerId(null);
          }
        },
        onStopped: () => {
          if (currentPrayerIdRef.current === prayerId) {
            setIsPlaying(false);
            setActivePrayerId(null);
          }
        },
        onError: (e) => {
          console.error("TTS Speech error:", e);
          setIsPlaying(false);
          setActivePrayerId(null);
        },
      });
    },
    [useOnlineAudio, readingSpeed]
  );

  const togglePlay = useCallback(
    (prayerId: number, rawHtmlText: string, onlineAudioUrl?: string) => {
      if (isPlaying && activePrayerId === prayerId) {
        stopReading();
      } else {
        startReading(prayerId, rawHtmlText, onlineAudioUrl);
      }
    },
    [isPlaying, activePrayerId, stopReading, startReading]
  );

  return {
    isPlaying,
    activePrayerId,
    audioSourceType,
    startReading,
    stopReading,
    togglePlay,
  };
}
