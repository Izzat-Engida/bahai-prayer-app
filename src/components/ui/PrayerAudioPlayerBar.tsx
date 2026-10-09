import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubeAudioPlayer from "./YoutubeAudioPlayer";
import NetInfo from "@react-native-community/netinfo";
import type { PrayerRaw } from "../../types/prayer.types";
import { colors, fonts } from "../../constants/theme";
import { useAppSelector } from "../../store";
import { useSpeechReader } from "../../hooks/useSpeechReader";

interface PrayerAudioPlayerBarProps {
  prayer: PrayerRaw;
}

type AudioMode = "tts" | "chant" | "reading";

function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length >= 10) {
    return match[2].substring(0, 11);
  }
  return null;
}

export default function PrayerAudioPlayerBar({ prayer }: PrayerAudioPlayerBarProps) {
  const { readingSpeed } = useAppSelector((state) => state.settings);
  const speechReader = useSpeechReader();

  const [activeMode, setActiveMode] = useState<AudioMode>("tts");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [failedVideoIds, setFailedVideoIds] = useState<Set<string>>(new Set());
  const voiceIsPlaying =
    speechReader.isPlaying && speechReader.activePrayerId === prayer.Id;
  const currentlyPlaying = activeMode === "tts" ? voiceIsPlaying : isPlaying;

  // Check available online audio tracks (matching chant/song/son or reading/read)
  const chantUrlObj = useMemo(() => {
    if (!prayer.Urls || prayer.Urls.length === 0) return null;
    return (
      prayer.Urls.find((u) => {
        if (!u.Url) return false;
        const title = (u.Title || "").toLowerCase();
        return (
          title.includes("song") ||
          title.includes("chant") ||
          title.includes("son")
        );
      }) ?? null
    );
  }, [prayer]);

  const readingUrlObj = useMemo(() => {
    if (!prayer.Urls || prayer.Urls.length === 0) return null;
    const match = prayer.Urls.find((u) => {
      if (!u.Url) return false;
      const title = (u.Title || "").toLowerCase();
      return (
        title.includes("read") ||
        title.includes("recitat")
      );
    });
    if (match) return match;
    return prayer.Urls.find((u) => !!u.Url) ?? null;
  }, [prayer]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  // Compute YouTube video ID for current active mode
  const currentYoutubeVideoId = useMemo(() => {
    if (activeMode === "chant" && chantUrlObj) {
      return extractYoutubeId(chantUrlObj.Url);
    }
    if (activeMode === "reading" && readingUrlObj) {
      return extractYoutubeId(readingUrlObj.Url);
    }
    return null;
  }, [activeMode, chantUrlObj, readingUrlObj]);

  // Stop playback & reset state when prayer changes
  useEffect(() => {
    speechReader.stopReading();
    setIsPlaying(false);
    setActiveMode("tts");
  }, [prayer.Id, speechReader.stopReading]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      speechReader.stopReading();
    };
  }, [speechReader.stopReading]);

  const stopPlayback = useCallback(() => {
    speechReader.stopReading();
    setIsPlaying(false);
  }, [speechReader.stopReading]);

  // Mode chip selection - DOES NOT AUTO START PLAYBACK
  const handleSelectMode = useCallback(
    (mode: AudioMode) => {
      stopPlayback();
      setActiveMode(mode);
    },
    [stopPlayback]
  );

  // Explicit user action to toggle audio playback
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (activeMode === "tts") {
      speechReader.togglePlay(prayer.Id, prayer.Text);
      return;
    } else if (activeMode === "chant" || activeMode === "reading") {
      const targetUrlObj = activeMode === "chant" ? chantUrlObj : readingUrlObj;
      const yid = targetUrlObj ? extractYoutubeId(targetUrlObj.Url) : null;
      const isFailed = yid ? failedVideoIds.has(yid) : false;

      if (yid && isOnline && !isFailed) {
        setIsPlaying(true);
      } else {
        // Fallback to the same online/local TTS pipeline if the video is unavailable.
        speechReader.togglePlay(prayer.Id, prayer.Text);
      }
    }
  }, [
    isPlaying,
    activeMode,
    prayer,
    readingSpeed,
    chantUrlObj,
    readingUrlObj,
    isOnline,
    failedVideoIds,
    stopPlayback,
    speechReader,
  ]);

  const getModeLabel = (mode: AudioMode) => {
    switch (mode) {
      case "tts":
        return speechReader.audioSourceType === "online"
          ? "Online Voice"
          : "Device Voice";
      case "chant":
        return "Online Chant";
      case "reading":
        return "Online Reading";
    }
  };

  const hasMultipleModes = chantUrlObj || readingUrlObj;

  return (
    <View style={styles.topContainer}>
      {/* Controlled Invisible YouTube Player */}
      {currentYoutubeVideoId && !failedVideoIds.has(currentYoutubeVideoId) ? (
        <YoutubeAudioPlayer
          videoId={currentYoutubeVideoId}
          play={isPlaying && activeMode !== "tts"}
          onReady={() => {
            console.log("YouTube player ready");
          }}
          onEnded={() => {
            setIsPlaying(false);
          }}
          onError={(error) => {
            console.warn("YouTube player error:", error);
            setIsPlaying(false);
            if (currentYoutubeVideoId) {
              setFailedVideoIds((prev) => new Set(prev).add(currentYoutubeVideoId));
            }
          }}
        />
      ) : null}

      {/* Mode Selector Chips (Only render buttons that actually have links) */}
      {hasMultipleModes ? (
        <View style={styles.modeSelectorRow}>
          <TouchableOpacity
            onPress={() => handleSelectMode("tts")}
            style={[
              styles.modeChip,
              activeMode === "tts" && styles.modeChipActive,
            ]}
            activeOpacity={0.8}
            accessibilityLabel="Select Device Voice Text to Speech"
            accessibilityRole="button"
          >
            <Ionicons
              name="mic"
              size={15}
              color={activeMode === "tts" ? colors.primary : "#FFFFFF"}
            />
            <Text
              style={[
                styles.modeChipText,
                activeMode === "tts" && styles.modeChipTextActive,
              ]}
            >
              Voice
            </Text>
          </TouchableOpacity>

          {chantUrlObj ? (
            <TouchableOpacity
              onPress={() => handleSelectMode("chant")}
              style={[
                styles.modeChip,
                activeMode === "chant" && styles.modeChipActive,
              ]}
              activeOpacity={0.8}
              accessibilityLabel="Select Online Chant rendition"
              accessibilityRole="button"
            >
              <Ionicons
                name="musical-notes"
                size={15}
                color={activeMode === "chant" ? colors.primary : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.modeChipText,
                  activeMode === "chant" && styles.modeChipTextActive,
                ]}
              >
                Chant
              </Text>
            </TouchableOpacity>
          ) : null}

          {readingUrlObj ? (
            <TouchableOpacity
              onPress={() => handleSelectMode("reading")}
              style={[
                styles.modeChip,
                activeMode === "reading" && styles.modeChipActive,
              ]}
              activeOpacity={0.8}
              accessibilityLabel="Select Online Recitation Reading"
              accessibilityRole="button"
            >
              <Ionicons
                name="book"
                size={15}
                color={activeMode === "reading" ? colors.primary : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.modeChipText,
                  activeMode === "reading" && styles.modeChipTextActive,
                ]}
              >
                Reading
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Main Play Controls Row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.playPauseBtn}
          activeOpacity={0.8}
          accessibilityLabel={
            currentlyPlaying ? "Pause audio reading" : `Play ${getModeLabel(activeMode)}`
          }
          accessibilityRole="button"
        >
          <Ionicons
            name={currentlyPlaying ? "pause" : "play"}
            size={22}
            color={colors.primary}
            style={{ marginLeft: currentlyPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>

        <View style={styles.statusInfoGroup}>
          <Text style={styles.statusTitleText} numberOfLines={1}>
            {currentlyPlaying
              ? `Playing ${getModeLabel(activeMode)}`
              : `${getModeLabel(activeMode)} Audio`}
          </Text>
          <Text style={styles.statusSubtext} numberOfLines={1}>
            {isPlaying
              ? "Tap pause to stop"
              : "Tap play button to listen out loud"}
          </Text>
        </View>

        {currentlyPlaying ? (
          <TouchableOpacity
            onPress={stopPlayback}
            style={styles.stopBtn}
            activeOpacity={0.7}
            accessibilityLabel="Stop audio"
            accessibilityRole="button"
          >
            <Ionicons name="stop-circle" size={26} color={colors.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: "#1B2A4A",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#C5A059",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 10,
    position: "relative",
  },
  modeSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 34,
  },
  modeChipActive: {
    backgroundColor: "#C5A059",
    borderColor: "#C5A059",
  },
  modeChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: "#FFFFFF",
  },
  modeChipTextActive: {
    color: colors.primary,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playPauseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#C5A059",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  statusInfoGroup: {
    flex: 1,
  },
  statusTitleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  statusSubtext: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "#D9D5CD",
    marginTop: 1,
  },
  stopBtn: {
    padding: 4,
  },
});
