import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import NetInfo from "@react-native-community/netinfo";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { useAppSelector } from "../store";
import { getSpeechText } from "../utils/textUtils";

const MAX_LOCAL_TTS_LENGTH = 3000;
const MAX_ONLINE_TTS_LENGTH = 180;

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return [];

  const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const chunks: string[] = [];
  let current = "";
  const pushCurrent = () => {
    if (current) chunks.push(current.trim());
    current = "";
  };

  for (const sentence of sentences) {
    for (const word of sentence.trim().split(/\s+/)) {
      if (!word) continue;
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxLength) {
        current = candidate;
      } else {
        pushCurrent();
        if (word.length > maxLength) {
          for (let i = 0; i < word.length; i += maxLength) {
            chunks.push(word.slice(i, i + maxLength));
          }
        } else {
          current = word;
        }
      }
    }
  }
  pushCurrent();
  return chunks;
}

function getOnlineTtsUrl(text: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q=${encodeURIComponent(text)}`;
}

export function useSpeechReader() {
  const { useOnlineAudio, readingSpeed } = useAppSelector((state) => state.settings);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePrayerId, setActivePrayerId] = useState<number | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<"online" | "tts">("tts");
  const audioPlayer = useAudioPlayer(null, { updateInterval: 250 });
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const currentPrayerIdRef = useRef<number | null>(null);
  const operationIdRef = useRef(0);
  const modeRef = useRef<"online" | "tts">("tts");
  const localChunksRef = useRef<string[]>([]);
  const onlineChunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const cleanTextRef = useRef("");

  const finishReading = useCallback(() => {
    setIsPlaying(false);
    setActivePrayerId(null);
    currentPrayerIdRef.current = null;
    localChunksRef.current = [];
    onlineChunksRef.current = [];
    chunkIndexRef.current = 0;
  }, []);

  const stopReading = useCallback(() => {
    operationIdRef.current += 1;
    Speech.stop();
    try {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    } catch (error) {
      console.warn("Audio stop error:", error);
    }
    finishReading();
  }, [audioPlayer, finishReading]);

  const speakLocalChunk = useCallback(
    (prayerId: number, operationId: number) => {
      if (operationIdRef.current !== operationId || currentPrayerIdRef.current !== prayerId) return;
      const chunk = localChunksRef.current[chunkIndexRef.current];
      if (!chunk) {
        finishReading();
        return;
      }

      modeRef.current = "tts";
      setAudioSourceType("tts");
      Speech.speak(chunk, {
        rate: readingSpeed,
        language: "en-US",
        onDone: () => {
          if (operationIdRef.current !== operationId || currentPrayerIdRef.current !== prayerId) return;
          chunkIndexRef.current += 1;
          speakLocalChunk(prayerId, operationId);
        },
        onStopped: () => {
          if (operationIdRef.current === operationId) finishReading();
        },
        onError: (error) => {
          console.warn("Local TTS error:", error);
          if (operationIdRef.current === operationId) finishReading();
        },
      });
    },
    [finishReading, readingSpeed]
  );

  const startLocalFallback = useCallback(
    (prayerId: number, operationId: number) => {
      modeRef.current = "tts";
      setAudioSourceType("tts");
      chunkIndexRef.current = 0;
      localChunksRef.current = splitTextIntoChunks(cleanTextRef.current, MAX_LOCAL_TTS_LENGTH);
      Speech.stop();
      speakLocalChunk(prayerId, operationId);
    },
    [speakLocalChunk]
  );

  const playOnlineChunk = useCallback(
    (prayerId: number, operationId: number) => {
      if (operationIdRef.current !== operationId || currentPrayerIdRef.current !== prayerId) return;
      const chunk = onlineChunksRef.current[chunkIndexRef.current];
      if (!chunk) {
        finishReading();
        return;
      }

      modeRef.current = "online";
      setAudioSourceType("online");
      try {
        audioPlayer.replace(getOnlineTtsUrl(chunk));
        audioPlayer.playbackRate = readingSpeed;
        audioPlayer.play();
      } catch (error) {
        console.warn("Online TTS unavailable; using local TTS:", error);
        startLocalFallback(prayerId, operationId);
      }
    },
    [audioPlayer, finishReading, readingSpeed, startLocalFallback]
  );

  useEffect(() => {
    if (!isPlaying || modeRef.current !== "online") return;
    if (audioStatus.didJustFinish) {
      chunkIndexRef.current += 1;
      playOnlineChunk(currentPrayerIdRef.current!, operationIdRef.current);
    } else if (audioStatus.error) {
      console.warn("Online TTS playback failed; using local TTS:", audioStatus.error);
      startLocalFallback(currentPrayerIdRef.current!, operationIdRef.current);
    }
  }, [audioStatus.didJustFinish, audioStatus.error, isPlaying, playOnlineChunk, startLocalFallback]);

  const startReading = useCallback(
    async (prayerId: number, rawHtmlText: string) => {
      operationIdRef.current += 1;
      const operationId = operationIdRef.current;
      await Speech.stop();
      try {
        audioPlayer.pause();
        audioPlayer.seekTo(0);
      } catch (error) {
        console.warn("Previous audio cleanup error:", error);
      }

      const cleanText = getSpeechText(rawHtmlText).replace(/\s+/g, " ").trim();
      if (!cleanText) return;
      cleanTextRef.current = cleanText;
      currentPrayerIdRef.current = prayerId;
      setActivePrayerId(prayerId);
      setIsPlaying(true);

      const network = await NetInfo.fetch();
      const canUseOnlineTts = useOnlineAudio && network.isConnected === true && network.isInternetReachable !== false;
      if (canUseOnlineTts) {
        onlineChunksRef.current = splitTextIntoChunks(cleanText, MAX_ONLINE_TTS_LENGTH);
        chunkIndexRef.current = 0;
        playOnlineChunk(prayerId, operationId);
      } else {
        startLocalFallback(prayerId, operationId);
      }
    },
    [audioPlayer, playOnlineChunk, startLocalFallback, useOnlineAudio]
  );

  const togglePlay = useCallback(
    (prayerId: number, rawHtmlText: string) => {
      if (isPlaying && activePrayerId === prayerId) stopReading();
      else startReading(prayerId, rawHtmlText);
    },
    [activePrayerId, isPlaying, startReading, stopReading]
  );

  useEffect(() => () => stopReading(), [stopReading]);

  return { isPlaying, activePrayerId, audioSourceType, startReading, stopReading, togglePlay };
}
