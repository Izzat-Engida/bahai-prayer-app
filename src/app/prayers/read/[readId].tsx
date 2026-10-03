import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayerDetails } from "../../../hooks/usePrayerDetails";
import { useFontSize } from "../../../hooks/useFontSize";
import Header from "../../../components/layout/header";
import { colors, fonts } from "../../../constants/theme";

export default function PrayerReadScreen() {
  const { readId } = useLocalSearchParams<{ readId: string }>();
  const numericId = readId ? Number(readId) : null;
  const prayer = usePrayerDetails(numericId);
  const { scaledSize } = useFontSize();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Prayer Reader" />

      <View style={styles.topBar}>
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
      </View>

      {prayer ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {prayer.FirstTagName ? (
              <Text style={[styles.author, { fontSize: scaledSize(13) }]}>
                {prayer.FirstTagName}
              </Text>
            ) : null}

            <Text
              style={[
                styles.prayerText,
                {
                  fontSize: scaledSize(18),
                  lineHeight: scaledSize(30),
                },
              ]}
            >
              {prayer.Text}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.muted} />
          <Text style={[styles.emptyText, { fontSize: scaledSize(15) }]}>
            Prayer not found.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  author: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  prayerText: {
    fontFamily: fonts.heading,
    color: colors.text,
    textAlign: "left",
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
});