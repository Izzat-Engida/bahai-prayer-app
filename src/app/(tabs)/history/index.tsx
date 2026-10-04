import React, { useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistory } from "../../../hooks/useHistory";
import { useFavorites } from "../../../hooks/useFavorites";
import { useFontSize } from "../../../hooks/useFontSize";
import PrayerListItem from "../../../components/ui/PrayerListItem";
import { colors, fonts } from "../../../constants/theme";

export default function HistoryScreen() {
  const { historySections, refreshHistory } = useHistory();
  const { favIds, toggleFav } = useFavorites();
  const { scaledSize } = useFontSize();

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <SectionList
        sections={historySections}
        keyExtractor={(item) => String(item.Id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.intro}>
            <View style={styles.eyebrowRow}>
              <View style={styles.goldLine} />
              <Text style={styles.eyebrow}>RECENT READINGS</Text>
              <View style={styles.goldLine} />
            </View>

            <Text style={[styles.heading, { fontSize: scaledSize(26) }]}>
              Reading History
            </Text>

            
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeaderTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <PrayerListItem
            prayer={item}
            index={index}
            isBookmarked={favIds.includes(item.Id)}
            onBookmarkPress={() => toggleFav(item.Id)}
            onPress={() =>
              router.push({
                pathname: "/prayers/read/[readId]",
                params: { readId: String(item.Id) },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="time-outline"
                size={32}
                color={colors.secondary}
              />
            </View>

            <Text style={styles.emptyTitle}>No Recent History</Text>
            <Text style={styles.emptyDescription}>
              Prayers you read will automatically appear here grouped by when you read them.
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
    paddingTop: 16,
    paddingBottom: 10,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
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
    color: colors.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 14,
  },
  sectionHeaderWrapper: {
    paddingVertical: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
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