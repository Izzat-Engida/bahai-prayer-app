import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  getHiddenWords,
  selectHiddenWordUrl,
  HIDDEN_WORDS_ARABIC_ID,
  HIDDEN_WORDS_PERSIAN_ID,
} from "../../../services/hiddenWordsService";
import type { HiddenWord } from "../../../types/hiddenword.types";
import { useFontSize } from "../../../hooks/useFontSize";
import { useFavorites } from "../../../hooks/useFavorites";
import { getPrayerPreview, stripHtml } from "../../../utils/textUtils";
import { colors, fonts } from "../../../constants/theme";

type GroupTab = "ARABIC" | "PERSIAN";

export default function HiddenWordsScreen() {
  const [selectedGroup, setSelectedGroup] = useState<GroupTab>("ARABIC");
  const [searchQuery, setSearchQuery] = useState("");
  const { scaledSize } = useFontSize();
  const { favIds, toggleFav } = useFavorites();

  const arabicWords = useMemo(() => getHiddenWords("ARABIC"), []);
  const persianWords = useMemo(() => getHiddenWords("PERSIAN"), []);

  const currentWords = selectedGroup === "ARABIC" ? arabicWords : persianWords;

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentWords;

    return currentWords.filter((item) => {
      const matchNumber = String(item.Number).includes(q);
      const cleanText = stripHtml(item.Text).toLowerCase();
      const matchText = cleanText.includes(q);
      return matchNumber || matchText;
    });
  }, [currentWords, searchQuery]);

  const handleSelectWord = useCallback(
    (item: HiddenWord) => {
      const categoryId = item.IsArabic
        ? HIDDEN_WORDS_ARABIC_ID
        : HIDDEN_WORDS_PERSIAN_ID;
      const categoryName = item.IsArabic
        ? "Arabic Hidden Words"
        : "Persian Hidden Words";

      router.push({
        pathname: "/prayers/read/[readId]",
        params: {
          readId: String(item.Id),
          categoryId: String(categoryId),
          categoryName,
        },
      });
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: HiddenWord }) => {
      const isBookmarked = favIds.includes(item.Id);
      const primaryUrl = selectHiddenWordUrl(item);
      const hasAudio = !!primaryUrl;
      const previewText = getPrayerPreview(item.Text);

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSelectWord(item)}
          style={styles.prayerItem}
        >
          <View style={styles.prayerContent}>
            <View style={styles.prayerTop}>
              <Text style={styles.prayerLabel}>
                {item.IsArabic ? "ARABIC" : "PERSIAN"} • #{item.Number}
              </Text>
              <View style={styles.actionButtons}>
                {hasAudio && (
                  <View style={styles.audioBadge}>
                    <Ionicons
                      name="musical-notes"
                      size={12}
                      color={colors.secondary}
                    />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => toggleFav(item.Id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={isBookmarked ? colors.secondary : "#A09A8F"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={[
                styles.prayerPreview,
                { fontSize: scaledSize(16), lineHeight: scaledSize(25) },
              ]}
              numberOfLines={3}
            >
              {previewText}
            </Text>

            <View style={styles.readRow}>
              <Text style={styles.readText}>Read Hidden Word</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [favIds, toggleFav, scaledSize, handleSelectWord]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => String(item.Id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.intro}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.eyebrowRow}>
              <View style={styles.goldLine} />
              <Text style={styles.eyebrow}>KALIMÁT-I-MAKNÚNIH</Text>
              <View style={styles.goldLine} />
            </View>

            <Text style={styles.heading}>The Hidden Words</Text>
            <Text style={styles.description}>
              Revealed by Bahá’u’lláh from 1857-1858, in Baghdad.
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSelectedGroup("ARABIC")}
                style={[
                  styles.optionCard,
                  selectedGroup === "ARABIC" && styles.optionCardActive,
                ]}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionBadgeActive}>
                    <Text style={styles.optionBadgeText}>Part I</Text>
                  </View>
                  <Ionicons
                    name={selectedGroup === "ARABIC" ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={selectedGroup === "ARABIC" ? colors.secondary : "#C0B8AA"}
                  />
                </View>

                <Text
                  style={[
                    styles.optionTitle,
                    selectedGroup === "ARABIC" && styles.optionTitleActive,
                  ]}
                >
                  Arabic
                </Text>
                <Text style={styles.optionSubtitle}>
                  {arabicWords.length} Verses
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSelectedGroup("PERSIAN")}
                style={[
                  styles.optionCard,
                  selectedGroup === "PERSIAN" && styles.optionCardActive,
                ]}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionBadgeActive}>
                    <Text style={styles.optionBadgeText}>Part II</Text>
                  </View>
                  <Ionicons
                    name={selectedGroup === "PERSIAN" ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={selectedGroup === "PERSIAN" ? colors.secondary : "#C0B8AA"}
                  />
                </View>

                <Text
                  style={[
                    styles.optionTitle,
                    selectedGroup === "PERSIAN" && styles.optionTitleActive,
                  ]}
                >
                  Persian
                </Text>
                <Text style={styles.optionSubtitle}>
                  {persianWords.length} Verses
                </Text>
              </TouchableOpacity>
            </View>

       
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#8D8982" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Search ${
                  selectedGroup === "ARABIC" ? "Arabic Part I" : "Persian Part II"
                }...`}
                placeholderTextColor="#8D8982"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#8D8982" />
                </Pressable>
              )}
            </View>

          
          </View>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={30}
                color={colors.secondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Hidden Words found</Text>
            <Text style={styles.emptyDescription}>
              Try searching with a number (e.g. 1, 15) or another keyword.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  intro: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  goldLine: {
    height: 1,
    width: 25,
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.secondary,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCardActive: {
    borderColor: colors.secondary,
    backgroundColor: "#FDFBF7",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionBadgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F0E8D8",
  },
  optionBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
  },
  optionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },

  collectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  collectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F0E8D8",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  prayerItem: {
    flexDirection: "row",
    paddingVertical: 20,
  },
  numberColumn: {
    width: 42,
    alignItems: "center",
    marginRight: 12,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCC99F",
    backgroundColor: "#F5F0E5",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
  },
  verticalLine: {
    width: 1,
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.border,
    marginTop: 10,
  },
  prayerContent: {
    flex: 1,
    paddingTop: 2,
  },
  prayerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  prayerLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.secondary,
    flex: 1,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F0E8D8",
    alignItems: "center",
    justifyContent: "center",
  },
  prayerPreview: {
    fontFamily: fonts.heading,
    fontStyle: "italic",
    color: colors.text,
    marginBottom: 12,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 0,
    opacity: 0.65,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0E8D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
    marginBottom: 6,
  },
  emptyDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
