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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayerDetails } from "../../../hooks/usePrayerDetails";
import { usePrayersByTag } from "../../../hooks/usePrayersByTag";
import { OBLIGATORY_CATEGORY_ID } from "../../../hooks/usePrayerTags";
import { useFontSize } from "../../../hooks/useFontSize";
import PrayerTextRenderer from "../../../components/ui/PrayerTextRenderer";
import { stripHtml } from "../../../utils/textUtils";
import { colors, fonts } from "../../../constants/theme";

export default function PrayerReadScreen() {
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
      const prevPrayer = categoryPrayers[currentIndex - 1];
      setActiveReadId(prevPrayer.Id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
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
          // Only grab touch start if 2 fingers touch for pinch-zoom
          return evt.nativeEvent.touches.length === 2;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // 2 fingers = Pinch zoom
          if (evt.nativeEvent.touches.length === 2) {
            return true;
          }
          // 1 finger: ONLY capture if movement is clearly a horizontal swipe (not vertical scrolling)
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
    setIsBookmarked((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header Bar with Action Icons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.rightActionsRow}>
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

      {/* Font Size Modal */}
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
              <Text style={styles.modalTitle}>Font & Reading Size</Text>
              <TouchableOpacity
                onPress={() => setFontModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Size Controls */}
            <View style={styles.sizeControlRow}>
              <TouchableOpacity
                onPress={zoomOut}
                style={styles.adjustBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.zoomPercentageBadge}>
                <Text style={styles.zoomPercentageText}>
                  {Math.round(zoomScale * 100)}%
                </Text>
              </View>

              <TouchableOpacity
                onPress={zoomIn}
                style={styles.adjustBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Quick Scale Presets */}
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

            <TouchableOpacity
              onPress={resetZoom}
              style={styles.resetBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>Reset to Default</Text>
            </TouchableOpacity>
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

  // Category Navigation Sub-Header
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

  // Font Size Modal Styles
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
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
  sizeControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomPercentageBadge: {
    minWidth: 80,
    alignItems: "center",
  },
  zoomPercentageText: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.primary,
    fontWeight: "700",
  },
  presetPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 18,
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
  resetBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resetBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.secondary,
  },
});