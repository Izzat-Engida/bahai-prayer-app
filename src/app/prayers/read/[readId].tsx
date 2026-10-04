import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Share,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayerDetails } from "../../../hooks/usePrayerDetails";
import { usePrayersByTag } from "../../../hooks/usePrayersByTag";
import { OBLIGATORY_CATEGORY_ID } from "../../../hooks/usePrayerTags";
import { useFontSize } from "../../../hooks/useFontSize";
import { useSpeechReader } from "../../../hooks/useSpeechReader";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setUseOnlineAudio, setReadingSpeed } from "../../../store/slices/settingsSlice";
import PrayerTextRenderer from "../../../components/ui/PrayerTextRenderer";
import { stripHtml } from "../../../utils/textUtils";
import { colors, fonts } from "../../../constants/theme";
import { recordHistory, isFavorite, toggleFavorite } from "../../../services/database";

export default function PrayerReadScreen() {
  const dispatch = useAppDispatch();
  const { useOnlineAudio, readingSpeed } = useAppSelector((state) => state.settings);

  const { readId, categoryId: paramCategoryId, categoryName: paramCategoryName } =
    useLocalSearchParams<{
      readId: string;
      categoryId?: string;
      categoryName?: string;
    }>();

  const [activeReadId, setActiveReadId] = useState<number | null>(
    readId ? Number(readId) : null
  );

  useEffect(() => {
    if (readId) {
      setActiveReadId(Number(readId));
    }
  }, [readId]);

  const prayer = usePrayerDetails(activeReadId);
  const { scaledSize } = useFontSize();
  const { isPlaying, activePrayerId, togglePlay, stopReading } = useSpeechReader();

  // Record history & load initial bookmark state whenever activeReadId changes
  useEffect(() => {
    if (activeReadId) {
      recordHistory(activeReadId);
      setIsBookmarked(isFavorite(activeReadId));
      stopReading();
    }
  }, [activeReadId]);

  // Category context for switching prayers in the same category
  const isObligatory = useMemo(() => {
    if (!prayer) return false;
    return prayer.Tags.some(
      (t) => t.Kind === "OBLIGATORY" || [101, 102, 104, OBLIGATORY_CATEGORY_ID].includes(t.Id)
    );
  }, [prayer]);

  const tagIdToUse = useMemo(() => {
    if (isObligatory) return OBLIGATORY_CATEGORY_ID;
    if (paramCategoryId) return Number(paramCategoryId);
    if (prayer?.Tags && prayer.Tags.length > 0) return prayer.Tags[0].Id;
    return null;
  }, [isObligatory, paramCategoryId, prayer]);

  const categoryPrayers = usePrayersByTag(tagIdToUse);

  const categoryTitle = useMemo(() => {
    if (isObligatory) return "Obligatory Prayers";
    if (paramCategoryName) return paramCategoryName;
    if (prayer?.FirstTagName) return prayer.FirstTagName;
    return "Prayers";
  }, [isObligatory, paramCategoryName, prayer]);

  const currentIndex = useMemo(() => {
    if (!activeReadId || categoryPrayers.length === 0) return -1;
    return categoryPrayers.findIndex((p) => p.Id === activeReadId);
  }, [activeReadId, categoryPrayers]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < categoryPrayers.length - 1;

  const goToPrev = () => {
    if (hasPrev) {
      stopReading();
      const prevPrayer = categoryPrayers[currentIndex - 1];
      setActiveReadId(prevPrayer.Id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      stopReading();
      const nextPrayer = categoryPrayers[currentIndex + 1];
      setActiveReadId(nextPrayer.Id);
    }
  };

  // Font zoom state & modal visibility
  const [zoomScale, setZoomScale] = useState(1);
  const [isFontModalVisible, setFontModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Swipe & pinch gesture responder
  const initialDistanceRef = useRef<number | null>(null);
  const baseScaleRef = useRef(1);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          return evt.nativeEvent.touches.length === 2;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          if (evt.nativeEvent.touches.length === 2) {
            return true;
          }
          const isHorizontal =
            Math.abs(gestureState.dx) > 40 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2.2;
          return isHorizontal;
        },
        onPanResponderGrant: (evt) => {
          if (evt.nativeEvent.touches.length === 2) {
            const [t1, t2] = evt.nativeEvent.touches;
            const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            initialDistanceRef.current = dist;
            baseScaleRef.current = zoomScale;
          }
        },
        onPanResponderMove: (evt) => {
          if (evt.nativeEvent.touches.length === 2 && initialDistanceRef.current !== null) {
            const [t1, t2] = evt.nativeEvent.touches;
            const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            const ratio = dist / initialDistanceRef.current;
            const nextScale = Math.min(Math.max(baseScaleRef.current * ratio, 0.75), 2.4);
            setZoomScale(nextScale);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (initialDistanceRef.current !== null) {
            initialDistanceRef.current = null;
            return;
          }
          const dx = gestureState.dx;
          const dy = gestureState.dy;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
            if (dx < 0 && hasNext) {
              goToNext();
            } else if (dx > 0 && hasPrev) {
              goToPrev();
            }
          }
        },
        onPanResponderTerminate: () => {
          initialDistanceRef.current = null;
        },
      }),
    [zoomScale, hasNext, hasPrev, currentIndex, categoryPrayers]
  );

  const zoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 2.4));
  const zoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.75));
  const resetZoom = () => setZoomScale(1);

  const isReadingThisPrayer = isPlaying && activePrayerId === activeReadId;

  const handleToggleAudio = () => {
    if (!prayer || !activeReadId) return;
    const onlineUrl = prayer.Urls?.[0]?.Url;
    togglePlay(activeReadId, prayer.Text, onlineUrl);
  };

  const handleShare = async () => {
    if (!prayer) return;
    const cleanText = stripHtml(prayer.Text);
    const shareMessage = prayer.FirstTagName
      ? `${prayer.FirstTagName.toUpperCase()}\n\n${cleanText}`
      : cleanText;

    try {
      await Share.share({
        message: shareMessage,
        title: prayer.FirstTagName || "Baha'i Prayer",
      });
    } catch (error) {
      console.error("Error sharing prayer:", error);
    }
  };

  const toggleBookmark = () => {
    if (activeReadId) {
      const newState = toggleFavorite(activeReadId);
      setIsBookmarked(newState);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header Bar with Action Icons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            stopReading();
            router.back();
          }}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.rightActionsRow}>
          {/* Audio Play/Pause Button */}
          <TouchableOpacity
            onPress={handleToggleAudio}
            style={[
              styles.audioButton,
              isReadingThisPrayer && styles.activeAudioButton,
            ]}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isReadingThisPrayer ? "pause" : "volume-high"}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Font Size Modal Trigger (Aa) */}
          <TouchableOpacity
            onPress={() => setFontModalVisible(true)}
            style={styles.iconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.fontAdjustIconText}>Aa</Text>
          </TouchableOpacity>

          {/* Bookmark / Favorite Icon */}
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.iconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            style={styles.iconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Navigation Bar (< Category Name >) */}
      {categoryPrayers.length > 0 ? (
        <View style={styles.categoryNavRow}>
          <TouchableOpacity
            onPress={goToPrev}
            disabled={!hasPrev}
            style={[styles.arrowBtn, !hasPrev && styles.arrowBtnDisabled]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={hasPrev ? colors.primary : colors.border}
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={[styles.categoryNavTitle, { fontSize: scaledSize(15) }]}
          >
            {categoryTitle}
          </Text>

          <TouchableOpacity
            onPress={goToNext}
            disabled={!hasNext}
            style={[styles.arrowBtn, !hasNext && styles.arrowBtnDisabled]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={hasNext ? colors.primary : colors.border}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Prayer Content Area */}
      {prayer ? (
        <View style={styles.flexOne} {...panResponder.panHandlers}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.prayerMainWrapper}>
              <PrayerTextRenderer html={prayer.Text} zoomScale={zoomScale} />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.muted} />
          <Text style={[styles.emptyText, { fontSize: scaledSize(15) }]}>
            Prayer not found.
          </Text>
        </View>
      )}

      {/* Font & Reading Settings Modal */}
      <Modal
        visible={isFontModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFontModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFontModalVisible(false)}
        >
          <Pressable
            style={styles.modalContentCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reading Preferences</Text>
              <TouchableOpacity
                onPress={() => setFontModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Font Size Scale */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Font Size</Text>
              <View style={styles.presetPillsRow}>
                {[
                  { label: "80%", scale: 0.8 },
                  { label: "100%", scale: 1.0 },
                  { label: "125%", scale: 1.25 },
                  { label: "150%", scale: 1.5 },
                ].map((preset) => {
                  const isActive = Math.abs(zoomScale - preset.scale) < 0.05;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => setZoomScale(preset.scale)}
                      style={[
                        styles.presetPill,
                        isActive && styles.presetPillActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          isActive && styles.presetPillTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reading Speed Setting */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>
                Reading Speed ({readingSpeed}x)
              </Text>
              <View style={styles.presetPillsRow}>
                {[0.75, 1.0, 1.25, 1.5].map((speed) => {
                  const isActive = readingSpeed === speed;
                  return (
                    <TouchableOpacity
                      key={speed}
                      onPress={() => dispatch(setReadingSpeed(speed))}
                      style={[
                        styles.presetPill,
                        isActive && styles.presetPillActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          isActive && styles.presetPillTextActive,
                        ]}
                      >
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Online Audio Setting */}
            <View style={styles.modalSwitchRow}>
              <View style={styles.switchTextGroup}>
                <Text style={styles.sectionLabel}>Online Audio Source</Text>
                <Text style={styles.switchSubtext}>
                  Use online voice when connected, or offline device TTS.
                </Text>
              </View>
              <Switch
                value={useOnlineAudio}
                onValueChange={(val) => {
                  dispatch(setUseOnlineAudio(val));
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#1B2A4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  activeAudioButton: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    elevation: 6,
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fontAdjustIconText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.primary,
  },

  categoryNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  categoryNavTitle: {
    fontFamily: fonts.heading,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 8,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    paddingBottom: 50,
  },
  prayerMainWrapper: {
    width: "100%",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    color: colors.muted,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContentCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  modalSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchTextGroup: {
    flex: 1,
  },
  switchSubtext: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  presetPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  presetPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetPillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
  presetPillTextActive: {
    color: colors.surface,
  },
});