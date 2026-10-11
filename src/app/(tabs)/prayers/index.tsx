
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { usePrayerTags } from "../../../hooks/usePrayerTags";
import PrayerCategory from "@/components/ui/PrayerCategory";
import { router } from "expo-router";
import { useFontSize } from "../../../hooks/useFontSize";
import { HIDDEN_WORDS_CATEGORY_ID } from "../../../services/hiddenWordsService";

const Prayers = () => {
  const { scaledSize } = useFontSize();
  const allTags = usePrayerTags("SIMPLIFIED");

  return (
    <SafeAreaView
      edges={["left", "right"]}
      className="flex-1 bg-neutral"
    >
      <FlatList
        data={allTags}
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
              Choose a prayer collection.
            </Text>
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
                if (item.Id === HIDDEN_WORDS_CATEGORY_ID) {
                  router.push("/prayers/hidden-words");
                } else {
                  router.push({
                    pathname: "/prayers/[categoryId]",
                    params: {
                      categoryId: String(item.Id),
                      categoryName: item.Name,
                    },
                  });
                }
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
              No prayer collections found
            </Text>
            <Text className="font-body text-sm text-muted mt-1 text-center">
              There are no prayer collections to show.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Prayers;
