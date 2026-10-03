
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { usePrayerTags } from "../../../hooks/usePrayerTags";
import PrayerCategory from "@/components/ui/PrayerCategory";
import { router } from "expo-router";
import { useFontSize } from "../../../hooks/useFontSize";

const filters = [
  { label: "All", value: "ALL" },
  { label: "Obligatory", value: "OBLIGATORY" },
  { label: "General", value: "GENERAL" },
  { label: "Occasional", value: "OCCASSIONAL" },
  { label: "Tablets", value: "TABLETS" },
];

const Prayers = () => {
  const { scaledSize } = useFontSize();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const generalTags = usePrayerTags("GENERAL");
  const occasionalTags = usePrayerTags("OCCASSIONAL");
  const tabletTags = usePrayerTags("TABLETS");
  const obligatoryTags = usePrayerTags("OBLIGATORY");

  const allTags = useMemo(
    () => [
      ...obligatoryTags,
      ...generalTags,
      ...occasionalTags,
      ...tabletTags,
    ],
    [obligatoryTags, generalTags, occasionalTags, tabletTags]
  );

  
  const filteredTags = useMemo(() => {
    return allTags.filter((tag) => {
      const matchesFilter =
        selectedFilter === "ALL" || tag.Kind === selectedFilter;

      const matchesSearch = tag.Name.toLowerCase().includes(
        search.trim().toLowerCase()
      );

      return matchesFilter && matchesSearch;
    });
  }, [allTags, selectedFilter, search]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      className="flex-1 bg-neutral"
    >
      <FlatList
        data={filteredTags}
        keyExtractor={(item) => `${item.Kind}-${item.Id}`}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="mb-6">
            <Text
              className="font-heading text-text mb-2"
              style={{ fontSize: scaledSize(24) }}
            >
              Prayer Categories
            </Text>
            <Text
              className="font-body text-muted mb-5"
              style={{ fontSize: scaledSize(14) }}
            >
              Explore prayers for different moments and occasions.
            </Text>

           
            <View className="flex-row items-center bg-white border border-border rounded-2xl px-4 h-12 mb-5">
              <Ionicons name="search-outline" size={20} color="#8D8982" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search prayer categories..."
                placeholderTextColor="#8D8982"
                className="flex-1 ml-3 text-text font-body"
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#8D8982" />
                </Pressable>
              )}
            </View>

            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {filters.map((filter) => {
                const isSelected = selectedFilter === filter.value;

                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => setSelectedFilter(filter.value)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-white border-border"
                    }`}
                  >
                    <Text
                      className={`font-bodyMedium text-sm ${
                        isSelected ? "text-white" : "text-text"
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 32,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <View style={{ width: "48.5%" }}>
            <PrayerCategory
              Id={item.Id}
              Kind={item.Kind}
              LanguageId={item.LanguageId}
              Name={item.Name}
              PrayerCount={item.PrayerCount}
              onPress={() => {
                router.push({
                  pathname: "/prayers/[categoryId]",
                  params: {
                    categoryId: String(item.Id),
                    categoryName: item.Name,
                  },
                });
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons
              name="search-outline"
              size={36}
              color="#8D8982"
            />
            <Text className="font-bodyMedium text-text mt-4">
              No categories found
            </Text>
            <Text className="font-body text-sm text-muted mt-1 text-center">
              Try another search or select a different filter.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Prayers;
