import { useState, useCallback, useEffect, useRef } from "react";
import * as Speech from "expo-speech";
import NetInfo from "@react-native-community/netinfo";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import { useAppSelector } from "../store";
import { getSpeechText } from "../utils/textUtils";

const MAX_TTS_CHUNK_LENGTH = 3000;


function splitTextIntoChunks(
  text: string,
  maxLength = MAX_TTS_CHUNK_LENGTH
): string[] {
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return [];
  }

  if (cleanText.length <= maxLength) {
    return [cleanText];
  }

  const sentences =
    cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (!trimmedSentence) {
      continue;
    }
    if (
      currentChunk.length +
        trimmedSentence.length +
        1 <=
      maxLength
    ) {
      currentChunk +=
        (currentChunk ? " " : "") + trimmedSentence;

      continue;
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    if (trimmedSentence.length > maxLength) {
      const words = trimmedSentence.split(/\s+/);

      for (const word of words) {
        if (
          currentChunk.length +
            word.length +
            1 <=
          maxLength
        ) {
          currentChunk +=
            (currentChunk ? " " : "") + word;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }

          currentChunk = word;
        }
      }
    } else {
      currentChunk = trimmedSentence;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function useSpeechReader() {
  const {
    useOnlineAudio,
    readingSpeed,
  } = useAppSelector(
    (state) => state.settings
  );

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [activePrayerId, setActivePrayerId] =
    useState<number | null>(null);

  const [audioSourceType, setAudioSourceType] =
    useState<"online" | "tts">("tts");
  const audioPlayer = useAudioPlayer(null, {
    updateInterval: 250,
  });

  const audioStatus =
    useAudioPlayerStatus(audioPlayer);

  const currentPrayerIdRef =
    useRef<number | null>(null);

  const usingOnlineAudioRef =
    useRef(false);

  const ttsChunksRef =
    useRef<string[]>([]);

  const currentChunkIndexRef =
    useRef(0);

  const operationIdRef = useRef(0);

  const finishReading = useCallback(() => {
    setIsPlaying(false);
    setActivePrayerId(null);

    currentPrayerIdRef.current = null;

    usingOnlineAudioRef.current = false;

    ttsChunksRef.current = [];
    currentChunkIndexRef.current = 0;
  }, []);


  const stopReading = useCallback(() => {
   
    operationIdRef.current += 1;
    Speech.stop();

    try {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    } catch (error) {
      console.warn(
        "Audio stop error:",
        error
      );
    }

    finishReading();
  }, [
    audioPlayer,
    finishReading,
  ]);

 
  const speakNextChunk = useCallback(
    (
      prayerId: number,
      operationId: number
    ) => {
    
      if (
        operationIdRef.current !==
        operationId
      ) {
        return;
      }

      if (
        currentPrayerIdRef.current !==
        prayerId
      ) {
        return;
      }

      const chunks =
        ttsChunksRef.current;

      const currentIndex =
        currentChunkIndexRef.current;

      /*
       * No more chunks.
       */
      if (
        currentIndex >=
        chunks.length
      ) {
        finishReading();
        return;
      }

      const chunk =
        chunks[currentIndex];

      Speech.speak(chunk, {
        rate: readingSpeed,
        language: "en-US",
        onDone: () => {
          if (
            operationIdRef.current !==
            operationId
          ) {
            return;
          }

          if (
            currentPrayerIdRef.current !==
            prayerId
          ) {
            return;
          }

          currentChunkIndexRef.current += 1;

          speakNextChunk(
            prayerId,
            operationId
          );
        },

        
        onStopped: () => {
          if (
            operationIdRef.current !==
            operationId
          ) {
            return;
          }

          if (
            currentPrayerIdRef.current ===
            prayerId
          ) {
            finishReading();
          }
        },

        
        onError: (error) => {
          console.error(
            "TTS Speech error:",
            error
          );

          if (
            operationIdRef.current !==
            operationId
          ) {
            return;
          }

          finishReading();
        },
      });
    },
    [
      readingSpeed,
      finishReading,
    ]
  );



  useEffect(() => {
    if (!usingOnlineAudioRef.current) {
      return;
    }

    if (!isPlaying) {
      return;
    }


    if (audioStatus.didJustFinish) {
      finishReading();
      return;
    }

    if (audioStatus.error) {
      console.error(
        "Online audio playback error:",
        audioStatus.error
      );

      finishReading();
    }
  }, [
    audioStatus.didJustFinish,
    audioStatus.error,
    isPlaying,
    finishReading,
  ]);

  const startReading = useCallback(
    async (
      prayerId: number,
      rawHtmlText: string,
      onlineAudioUrl?: string
    ) => {
     
      operationIdRef.current += 1;

      const operationId =
        operationIdRef.current;
      await Speech.stop();

      try {
        audioPlayer.pause();
        audioPlayer.seekTo(0);
      } catch (error) {
        console.warn(
          "Previous audio cleanup error:",
          error
        );
      }

      const cleanText =
        getSpeechText(rawHtmlText);

      if (!cleanText) {
        return;
      }

      const netState =
        await NetInfo.fetch();

      const isOnline =
        !!netState.isConnected &&
        !!netState.isInternetReachable;

      const shouldUseOnlineAudio =
        useOnlineAudio &&
        isOnline &&
        !!onlineAudioUrl;

  
      currentPrayerIdRef.current =
        prayerId;

      setActivePrayerId(prayerId);
      setIsPlaying(true);

      if (shouldUseOnlineAudio) {
        usingOnlineAudioRef.current =
          true;

        setAudioSourceType("online");

        try {
          
          audioPlayer.replace(
            onlineAudioUrl!
          );

          audioPlayer.playbackRate = 1;
          audioPlayer.play();

          return;
        } catch (error) {
         
          console.error(
            "Online audio failed, falling back to TTS:",
            error
          );

          usingOnlineAudioRef.current =
            false;

          setAudioSourceType("tts");
        }
      }

     
      usingOnlineAudioRef.current =
        false;

      setAudioSourceType("tts");

    
      const chunks =
        splitTextIntoChunks(cleanText);

      ttsChunksRef.current = chunks;

      currentChunkIndexRef.current = 0;

      speakNextChunk(
        prayerId,
        operationId
      );
    },
    [
      useOnlineAudio,
      audioPlayer,
      speakNextChunk,
    ]
  );

  const togglePlay = useCallback(
    (
      prayerId: number,
      rawHtmlText: string,
      onlineAudioUrl?: string
    ) => {
     
      if (
        isPlaying &&
        activePrayerId === prayerId
      ) {
        stopReading();
        return;
      }
      startReading(
        prayerId,
        rawHtmlText,
        onlineAudioUrl
      );
    },
    [
      isPlaying,
      activePrayerId,
      stopReading,
      startReading,
    ]
  );

  useEffect(() => {
    return () => {

      operationIdRef.current += 1;
      Speech.stop();

      try {
        audioPlayer.pause();
        audioPlayer.seekTo(0);
      } catch (error) {
        console.warn(
          "Audio cleanup error:",
          error
        );
      }
    };
  }, [audioPlayer]);
  return {
    isPlaying,
    activePrayerId,
    audioSourceType,

    startReading,
    stopReading,
    togglePlay,
  };
}
