import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PrayerRaw } from "../../types/prayer.types";
import { colors, fonts } from "../../constants/theme";
import { useFontSize } from "../../hooks/useFontSize";
import {
  getPrayerPreview,
  getAuthorName,
  getWordCount,
} from "../../utils/textUtils";

type PrayerListItemProps = {
  prayer: PrayerRaw;
  index: number;
  onPress: () => void;
  onBookmarkPress?: () => void;
  isBookmarked?: boolean;
};

export default function PrayerListItem({
  prayer,
  index,
  onPress,
  onBookmarkPress,
  isBookmarked = false,
}: PrayerListItemProps) {
  const { scaledSize } = useFontSize();
  const preview = getPrayerPreview(prayer.Text);
  const categoryName =
    prayer.Tags?.[0]?.Name || prayer.FirstTagName || "Prayer";
  const authorName = getAuthorName(prayer.AuthorId);
  const words = getWordCount(prayer.Text);

  const metaParts: string[] = [];
  if (authorName) metaParts.push(authorName);
  if (words > 0) metaParts.push(`${words} words`);
  const metaString = metaParts.join(" • ");

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.prayerItem}
      onPress={onPress}
    >
      <View style={styles.prayerContent}>
        <Text
          style={[
            styles.prayerTitle,
            {
              fontSize: scaledSize(18),
              lineHeight: scaledSize(24),
            },
          ]}
          numberOfLines={2}
        >
          {categoryName}
        </Text>

        <Text
          style={[
            styles.prayerPreview,
            {
              fontSize: scaledSize(16),
              lineHeight: scaledSize(25),
            },
          ]}
          numberOfLines={3}
        >
          {preview}
        </Text>

        <View style={styles.metaRow}>
          <TouchableOpacity
            onPress={onBookmarkPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.bookmarkBtn}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isBookmarked ? colors.secondary : colors.muted}
            />
          </TouchableOpacity>

          <Text
            style={[styles.metaText, { fontSize: scaledSize(12) }]}
            numberOfLines={1}
          >
            {metaString}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  prayerItem: {
    paddingVertical: 16,
  },
  prayerContent: {
    flex: 1,
  },
  prayerPreview: {
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: 10,
  },
  prayerTitle: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookmarkBtn: {
    paddingRight: 2,
  },
  metaText: {
    fontFamily: fonts.bodyMedium,
    color: colors.muted,
    flex: 1,
  },
});
