
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { usePrayersByTag } from "../../hooks/usePrayersByTag";
import { useFontSize } from "../../hooks/useFontSize";
import PrayerListItem from "../../components/ui/PrayerListItem";
import { colors, fonts } from "../../constants/theme";

export default function CategoryPrayersScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName?: string;
  }>();

  const numericId = categoryId ? Number(categoryId) : null;
  const prayers = usePrayersByTag(numericId);
  const { scaledSize } = useFontSize();

  const name = categoryName || "Prayers";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={prayers}
        keyExtractor={(item) => String(item.Id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
              <Text style={styles.eyebrow}>THE PRAYER COLLECTION</Text>
              <View style={styles.goldLine} />
            </View>

            <Text style={styles.heading}>{name}</Text>

           

            <View style={styles.collectionInfo}>
              <View style={styles.collectionIcon}>
                <Ionicons
                  name="book-outline"
                  size={17}
                  color={colors.secondary}
                />
              </View>

              <Text style={styles.collectionCount}>
                {prayers.length} {prayers.length === 1 ? "prayer" : "prayers"}
              </Text>

              
            </View>

            <View style={styles.sectionHeading}>
         
              <View style={styles.sectionLine} />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <PrayerListItem
            prayer={item}
            index={index}
            onPress={() =>
              router.push({
                pathname: "/prayers/read/[readId]",
                params: {
                  readId: String(item.Id),
                  categoryId: String(categoryId),
                  categoryName: name,
                },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="book-outline"
                size={30}
                color={colors.secondary}
              />
            </View>

            <Text style={styles.emptyTitle}>A quiet space awaits</Text>
            <Text style={styles.emptyDescription}>
              There are no prayers in this collection yet.
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
    marginBottom: 18,
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
    marginBottom: 10,
  },

  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 18,
  },

  collectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 30,
    gap: 9,
  },

  collectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0E8D8",
    alignItems: "center",
    justifyContent: "center",
  },

  collectionCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },

  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },

  collectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },

  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
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

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 54,
    opacity: 0.65,
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0E8D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: colors.primary,
    marginBottom: 8,
  },

  emptyDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
