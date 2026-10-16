import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { UsePracticeStore } from "../../zustand/StorePraticalQuestions";
import { CATEGORIES } from "../js/categories";
import { getQuestions } from "../js/questionBank"; // adjust the path to where you save it

const QUESTIONS_PER_QUIZ = 20; // keep in sync with the number in your zustand store

const STEPS = [
  { title: "Answer random questions", text: "Each attempt picks a fresh set from the question bank." },
  { title: "Get feedback right away", text: "See if you were right, with a short explanation." },
  { title: "Check your score", text: "Finish the quiz and see how you did. Retake it anytime." },
];

export default function QuizIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearPracticeData, setPracticeData } = UsePracticeStore();

  // sent from the Home screen: router.push({ pathname: "/quiz", params: { categoryId, category } })
  const params = useLocalSearchParams();
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const questions = category ? getQuestions(category.id) : [];
  const count = Math.min(QUESTIONS_PER_QUIZ, questions.length);
  const ready = count > 0;

  const handleStart = () => {
    if (!category || !ready) return;
    // clear old data, then build a new random set for the chosen category
    clearPracticeData();
    setPracticeData(questions, category.title);
    router.push("/screen/quiz-screen");
  };

  /* category not found (bad link) */
  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030A22] px-8">
        <Ionicons name="alert-circle-outline" size={44} color="#64748B" />
        <Text className="mt-3 text-center text-[16px] text-slate-300">
          We couldn't find that category.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-5 rounded-2xl bg-indigo-500 px-6 py-3">
          <Text className="font-bold text-white">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const [c1, c2] = category.colors;

  return (
    <View className="flex-1 bg-[#030A22]">
      <StatusBar style="light" />

      <LinearGradient
        colors={["#0B1B5C", "#050E34", "#030A22"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* glow in the category colour */}
      <View
        style={{
          position: "absolute",
          top: -90,
          alignSelf: "center",
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: c1,
          opacity: 0.16,
        }}
      />

      <SafeAreaView edges={["top"]} className="flex-1">
        {/* top bar */}
        <View className="flex-row items-center px-5 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 active:bg-white/20"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Text className="ml-3 text-[15px] font-semibold text-slate-300">Quiz</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        >
          {/* hero */}
          <View className="items-center pt-8">
            <View
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <LinearGradient
                  colors={[c1, c2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: c1,
                    shadowOpacity: 0.7,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 12,
                  }}
                >
                  <Ionicons name={category.icon} size={40} color="#fff" />
                </LinearGradient>
              </View>
            </View>

            <Text className="mt-6 text-center text-[28px] font-extrabold leading-9 text-white">
              {category.title}
            </Text>
            <Text className="mt-2 px-4 text-center text-[14.5px] leading-6 text-slate-300">
              Test what you know and find out where you stand.
            </Text>
          </View>

          {/* quick facts */}
          <View className="mt-7 flex-row">
            {[
              { icon: "help-circle-outline", label: ready ? `${count} questions` : "Coming soon" },
              { icon: "shuffle-outline", label: "Random order" },
              { icon: "flash-outline", label: "Instant feedback" },
            ].map((f) => (
              <View
                key={f.label}
                className="mx-1 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3.5"
              >
                <Ionicons name={f.icon} size={20} color={c1} />
                <Text className="mt-1.5 text-center text-[11.5px] font-semibold text-slate-200">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>

          {/* topics covered */}
          <Text className="mb-3 mt-8 text-[16px] font-bold text-white">Topics covered</Text>
          <View className="flex-row flex-wrap">
            {category.topics.map((t) => (
              <View
                key={t}
                className="mb-2 mr-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5"
              >
                <Text className="text-[12.5px] text-slate-200">{t}</Text>
              </View>
            ))}
          </View>

          {/* how it works */}
          <Text className="mb-4 mt-6 text-[16px] font-bold text-white">How it works</Text>
          {STEPS.map((s, i) => (
            <View key={s.title} className="flex-row">
              <View className="items-center">
                <LinearGradient
                  colors={[c1, c2]}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-[13px] font-extrabold text-white">{i + 1}</Text>
                </LinearGradient>
                {i < STEPS.length - 1 && <View className="my-1 w-px flex-1 bg-white/15" />}
              </View>
              <View className="ml-4 flex-1 pb-5">
                <Text className="text-[14.5px] font-bold text-white">{s.title}</Text>
                <Text className="mt-0.5 text-[13px] leading-5 text-slate-400">{s.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* sticky start button */}
        <View
          className="border-t border-white/10 bg-[#030A22]/90 px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Pressable
            onPress={handleStart}
            disabled={!ready}
            accessibilityRole="button"
            accessibilityLabel="Start quiz"
            className="active:opacity-85 active:scale-[0.98]"
            style={{ opacity: ready ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                borderRadius: 18,
                shadowColor: "#6366F1",
                shadowOpacity: 0.5,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
            >
              <Text className="mr-2 text-[16px] font-bold text-white">
                {ready ? "Start Quiz" : "Questions coming soon"}
              </Text>
              {ready && <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}