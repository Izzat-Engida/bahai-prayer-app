import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayersByTag } from "../../hooks/usePrayersByTag";
import { useFontSize } from "../../hooks/useFontSize";
import Header from "../../components/layout/header";
import { colors, fonts } from "../../constants/theme";

export default function CategoryPrayersScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName?: string;
  }>();

  const numericId = categoryId ? Number(categoryId) : null;
  const prayers = usePrayersByTag(numericId);
  const { scaledSize } = useFontSize();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={categoryName || "Prayers"} />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backText, { fontSize: scaledSize(14) }]}>
            Back
          </Text>
        </TouchableOpacity>

        <Text style={[styles.countBadge, { fontSize: scaledSize(12) }]}>
          {prayers.length} {prayers.length === 1 ? "prayer" : "prayers"}
        </Text>
      </View>

      <FlatList
        data={prayers}
        keyExtractor={(item) => String(item.Id)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/prayers/read/[readId]",
                params: { readId: String(item.Id) },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.author, { fontSize: scaledSize(12) }]}>
                {item.FirstTagName || "Bahá’í Prayer"}
              </Text>
              <Text style={[styles.wordCount, { fontSize: scaledSize(11) }]}>
                {item.Text.split(/\s+/).length} words
              </Text>
            </View>

            <Text
              style={[
                styles.snippet,
                { fontSize: scaledSize(15), lineHeight: scaledSize(22) },
              ]}
              numberOfLines={3}
            >
              {item.Text}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={[styles.readMore, { fontSize: scaledSize(13) }]}>
                Read full prayer
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.secondary}
              />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { fontSize: scaledSize(15) }]}>
              No prayers found in this category.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
  countBadge: {
    fontFamily: fonts.body,
    color: colors.muted,
    backgroundColor: colors.neutral,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContainer: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  author: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  wordCount: {
    fontFamily: fonts.body,
    color: colors.muted,
  },
  snippet: {
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral,
  },
  readMore: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    color: colors.muted,
  },
});