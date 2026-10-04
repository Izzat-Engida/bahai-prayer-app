
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TagRaw } from "../../types/prayer.types";
import { colors, fonts } from "../../constants/theme";
import CategoryIllustration, { type ArtType } from "./CategoryIllustration";
import { useFontSize } from "../../hooks/useFontSize";

type PrayerCategoryProps = TagRaw & {
  onPress?: () => void;
};

const palettes = [
  { background: "#E7EFE5", accent: "#66836B", decoration: "#C5D9C0" },
  { background: "#F3E7E8", accent: "#A66B79", decoration: "#E8C9D0" },
  { background: "#E6EDF5", accent: "#627FAD", decoration: "#C5D5E8" },
  { background: "#F7EBDD", accent: "#B47D45", decoration: "#EED5B5" },
  { background: "#EEE8F5", accent: "#9272AE", decoration: "#D8C9E9" },
  { background: "#E3F2FD", accent: "#3B82F6", decoration: "#BFDBFE" },
  { background: "#FFF3E0", accent: "#D97706", decoration: "#FDE68A" },
  { background: "#E8F5E9", accent: "#2E7D32", decoration: "#C8E6C9" },
];

const ALL_ART_TYPES: ArtType[] = [
  "flower",
  "sunrise",
  "moon",
  "book",
  "leaf",
  "star",
  "community",
  "candle",
  "shield",
  "hands",
  "dove",
  "fountain",
  "tree",
  "fire",
  "ring",
  "flag",
];

const getArtType = (name: string, id: number | string): ArtType => {
  const n = name.toLowerCase();

  if (n.includes("fire")) return "fire";
  if (n.includes("marriage")) return "ring";


  if (
    n.includes("america") ||
    n.includes("canada") ||
    n.includes("country") ||
    n.includes("countries") ||
    n.includes("divine plan")
  ) return "flag";

 
  if (
    n.includes("additional") ||
    n.includes("bahá’u’lláh") ||
    n.includes("bahaullah") ||
    n.includes("‘abdu’l‑bahá") ||
    n.includes("abdul-baha")
  ) return "star";

  if (
    n.includes("morning") ||
    n.includes("birth") ||
    n.includes("naw-rúz") ||
    n.includes("naw-ruz") ||
    n.includes("declaration") ||
    n.includes("ascension") ||
    n.includes("ridván") ||
    n.includes("ridvan") ||
    n.includes("enlightenment")
  ) return "sunrise";

  if (n.includes("evening") || n.includes("night")) return "moon";

  if (
    n.includes("healing") ||
    n.includes("forgiveness") ||
    n.includes("departed") ||
    n.includes("women") ||
    n.includes("intercalary")
  ) return "flower";

  if (
    n.includes("protection") ||
    n.includes("trust") ||
    n.includes("tests") ||
    n.includes("difficulties") ||
    n.includes("firmness") ||
    n.includes("steadfastness")
  ) return "shield";

  if (
    n.includes("guidance") ||
    n.includes("aid") ||
    n.includes("assistance") ||
    n.includes("teaching")
  ) return "candle";

  if (
    n.includes("praise") ||
    n.includes("gratitude") ||
    n.includes("fund") ||
    n.includes("huqúqu'lláh") ||
    n.includes("huququ'llah")
  ) return "hands";

  if (
    n.includes("unity") ||
    n.includes("humanity") ||
    n.includes("family") ||
    n.includes("families") ||
    n.includes("children") ||
    n.includes("gathering") ||
    n.includes("assembly")
  ) return "community";

  if (
    n.includes("mariner") ||
    n.includes("martyr") ||
    n.includes("sacrifice") ||
    n.includes("journey") ||
    n.includes("triumph")
  ) return "dove";

  if (
    n.includes("spiritual growth") ||
    n.includes("nearness") ||
    n.includes("fast")
  ) return "fountain";

  if (
    n.includes("covenant") ||
    n.includes("visitation")
  ) return "tree";

  if (
    n.includes("detachment") ||
    n.includes("growth") ||
    n.includes("youth") ||
    n.includes("service")
  ) return "leaf";

  if (
    n.includes("obligatory") ||
    n.includes("epistle") ||
    n.includes("reference library") ||
    n.includes("tablets") ||
    n.includes("hidden words") ||
    n.includes("tablet of ahmad")
  ) return "book";


  let hash = 0;
  const str = `${id}-${name}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return ALL_ART_TYPES[Math.abs(hash) % ALL_ART_TYPES.length];
};

const PrayerCategory = ({
  Id,
  Name,
  PrayerCount,
  onPress,
}: PrayerCategoryProps) => {
  const { scaledSize } = useFontSize();
  const palette = palettes[
    (Math.abs(Number(Id) || 1) - 1) % palettes.length
  ];

  const artType = getArtType(Name, Id);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View
        style={[
          styles.artArea,
          { backgroundColor: palette.background },
        ]}
      >
        <View
          style={[
            styles.decorativeCircle,
            { backgroundColor: palette.decoration },
          ]}
        />
        <CategoryIllustration
          type={artType}
          color={palette.decoration}
          accent={palette.accent}
        />
        <View style={styles.artLabel}>
          <Ionicons
            name="sparkles-outline"
            size={13}
            color={palette.accent}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.categoryName, { fontSize: scaledSize(16), lineHeight: scaledSize(23) }]}
          numberOfLines={3}
        >
          {Name}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.count, { fontSize: scaledSize(12) }]}>
            {PrayerCount} {Number(PrayerCount) === 1 ? "prayer" : "prayers"}
          </Text>
          <View
            style={[
              styles.arrow,
              { backgroundColor: palette.background },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={16}
              color={palette.accent}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PrayerCategory;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  artArea: {
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  decorativeCircle: {
    width: 120,
    height: 120,
    borderRadius: 100,
    position: "absolute",
    top: -55,
    right: -35,
    opacity: 0.45,
  },
  artLabel: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFFB8",
  },
  content: {
    padding: 15,
    minHeight: 112,
    justifyContent: "space-between",
    gap: 12,
  },
  categoryName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 23,
    color: colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    flexShrink: 1,
  },
  arrow: {
    height: 30,
    width: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
