import React, { useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CATEGORIES } from "../js/categories"; // adjust the path to where you save it

const TOTAL_TOPICS = CATEGORIES.reduce((sum, c) => sum + c.topics.length, 0);

/* ───────────────────────── Category card ───────────────────────── */

function CategoryCard({ item, topics, expanded, onToggle, onOpenTopic, onOpenAll }) {
  return (
    <View className="mb-3 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
      {/* header row */}
      <Pressable onPress={onToggle} className="flex-row items-center p-4 active:bg-white/5">
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={item.icon} size={24} color="#fff" />
        </LinearGradient>

        <View className="ml-4 flex-1">
          <Text className="text-[16px] font-bold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="mt-0.5 text-[12.5px] text-slate-400">{item.topics.length} topics</Text>
        </View>

        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
      </Pressable>

      {/* topics */}
      {expanded && (
        <View className="border-t border-white/10 px-4 pb-4 pt-3">
          <Pressable
            onPress={onOpenAll}
            className="mb-3 flex-row items-center justify-center rounded-2xl bg-indigo-500 py-3 active:opacity-85"
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text className="ml-2 text-[14px] font-bold text-white">Quiz me on everything</Text>
          </Pressable>

          {topics.map((topic) => (
            <Pressable
              key={topic}
            //   onPress={() => onOpenTopic(topic)}
              className="flex-row items-center justify-between rounded-xl px-2 py-3 active:bg-white/10"
            >
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-2 w-2 rounded-full bg-indigo-400" />
                <Text className="flex-1 text-[14.5px] text-slate-200">{topic}</Text>
              </View>
              {/* <Ionicons name="chevron-forward" size={16} color="#64748B" /> */}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/* ───────────────────────── Screen ───────────────────────── */

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const q = query.trim().toLowerCase();

  // when searching: keep categories that match by name or by a topic, show only the matching topics
  const data = useMemo(() => {
    if (!q) return CATEGORIES.map((c) => ({ ...c, shownTopics: c.topics }));
    return CATEGORIES.map((c) => {
      const nameHit = c.title.toLowerCase().includes(q);
      const shownTopics = nameHit ? c.topics : c.topics.filter((t) => t.toLowerCase().includes(q));
      return { ...c, shownTopics, hit: nameHit || shownTopics.length > 0 };
    }).filter((c) => c.hit);
  }, [q]);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

//   const openQuiz = (category, topic) =>
//     router.push({
//       pathname: "/quiz", // change to your quiz route
//       params: { category: category.title, topic: topic || "" },
//     });

const openQuiz = (category) =>
  router.push({
    pathname: "/screen/quiz", // the file below should be app/quiz/index.js
    params: { categoryId: category.id, category: category.title },
  });


  return (
    <View className="flex-1 bg-[#030A22]">
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0B1B5C", "#050E34", "#030A22"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView edges={["top"]} className="flex-1">
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            <View className="pb-4 pt-3">
              <Text className="text-[30px] font-extrabold text-white">
                Tech<Text className="text-indigo-400">Quiz</Text>
              </Text>
              <Text className="mt-1 text-[14.5px] text-slate-300">
                {CATEGORIES.length} categories · {TOTAL_TOPICS} topics. Pick one and test yourself.
              </Text>

              {/* search */}
              <View className="mt-5 flex-row items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4">
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search a category or topic"
                  placeholderTextColor="#64748B"
                  className="ml-3 flex-1 py-3.5 text-[15px] text-white"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                )}
              </View>

              <Text className="mb-1 mt-6 text-[17px] font-bold text-white">Choose a Category</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CategoryCard
              item={item}
              topics={item.shownTopics}
              expanded={q ? true : openId === item.id}
              onToggle={() => toggle(item.id)}
              onOpenTopic={(topic) => openQuiz(item, topic)}
              onOpenAll={() => openQuiz(item, "")}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={40} color="#475569" />
              <Text className="mt-3 text-[15px] text-slate-400">Nothing found for “{query}”</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}