import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PrayerRaw } from "../../types/prayer.types";
import { colors, fonts } from "../../constants/theme";
import { useFontSize } from "../../hooks/useFontSize";

type PrayerListItemProps = {
  prayer: PrayerRaw;
  index: number;
  onPress: () => void;
  onBookmarkPress?: () => void;
};

export default function PrayerListItem({
  prayer,
  index,
  onPress,
  onBookmarkPress,
}: PrayerListItemProps) {
  const { scaledSize } = useFontSize();
  const preview = prayer.Text.replace(/\s+/g, " ").trim();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.prayerItem}
      onPress={onPress}
    >
      <View style={styles.numberColumn}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.verticalLine} />
      </View>

      <View style={styles.prayerContent}>
        <View style={styles.prayerTop}>
          <Text style={styles.prayerLabel}>
            {prayer.FirstTagName || "BAHÁ’Í PRAYER"}
          </Text>

          <TouchableOpacity
            onPress={onBookmarkPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark-outline" size={17} color={colors.muted} />
          </TouchableOpacity>
        </View>

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

        <View style={styles.readRow}>
          <Text style={styles.readText}>Read prayer</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DCC99F",
    backgroundColor: "#F5F0E5",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: fonts.bodyMedium,
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
    marginBottom: 10,
  },
  prayerLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.secondary,
    flex: 1,
    marginRight: 10,
  },
  prayerPreview: {
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: 14,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  readText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
});
