import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { UsePracticeStore } from "../../zustand/StorePraticalQuestions";
import { evaluateQuiz } from "../../components/evaluateQuiz";

const letterFor = (i) => String.fromCharCode(65 + i);

const STATUS = {
  correct: { label: "Correct", icon: "checkmark-circle", color: "#34D399", badge: "border-emerald-400/30 bg-emerald-500/15", text: "text-emerald-300" },
  wrong: { label: "Wrong", icon: "close-circle", color: "#F87171", badge: "border-red-400/30 bg-red-500/15", text: "text-red-300" },
  skipped: { label: "Skipped", icon: "remove-circle", color: "#94A3B8", badge: "border-slate-400/30 bg-slate-500/15", text: "text-slate-300" },
};

/* ───────────────────────── One option row ───────────────────────── */

function OptionRow({ text, index, userIndex, correctIndex }) {
  const isCorrect = index === correctIndex;
  const isUserPick = index === userIndex;
  const isWrongPick = isUserPick && !isCorrect;

  const box = isCorrect
    ? "border-emerald-400/60 bg-emerald-500/10"
    : isWrongPick
    ? "border-red-400/60 bg-red-500/10"
    : "border-white/10 bg-white/[0.04]";

  const letterBox = isCorrect ? "bg-emerald-500" : isWrongPick ? "bg-red-500" : "bg-white/10";
  const letterText = isCorrect || isWrongPick ? "text-white" : "text-slate-300";
  const textColor = isCorrect ? "text-emerald-100" : isWrongPick ? "text-red-100" : "text-slate-300";

  // small tag on the right
  let tag = null;
  if (isCorrect && isUserPick) tag = { label: "Your answer", cls: "bg-emerald-500/25 text-emerald-200" };
  else if (isCorrect) tag = { label: "Correct answer", cls: "bg-emerald-500/25 text-emerald-200" };
  else if (isWrongPick) tag = { label: "Your answer", cls: "bg-red-500/25 text-red-200" };

  return (
    <View className={`mb-2 flex-row items-center rounded-2xl border p-3 ${box}`}>
      <View className={`h-8 w-8 items-center justify-center rounded-lg ${letterBox}`}>
        <Text className={`text-[13px] font-extrabold ${letterText}`}>{letterFor(index)}</Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className={`text-[14px] leading-5 ${textColor} ${isCorrect || isWrongPick ? "font-semibold" : "font-medium"}`}>
          {text}
        </Text>
        {tag && (
          <View className={`mt-1.5 self-start rounded-md px-2 py-0.5 ${tag.cls.split(" ")[0]}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wide ${tag.cls.split(" ")[1]}`}>{tag.label}</Text>
          </View>
        )}
      </View>

      {isCorrect && <Ionicons name="checkmark-circle" size={20} color="#34D399" />}
      {isWrongPick && <Ionicons name="close-circle" size={20} color="#F87171" />}
    </View>
  );
}

/* ───────────────────────── Question card ───────────────────────── */

function QuestionCard({ item }) {
  const s = STATUS[item.status];

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
      {/* coloured status strip */}
      <View style={{ height: 3, backgroundColor: s.color }} />

      <View className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <Text className="text-[12px] font-extrabold text-white">{item.number}</Text>
            </View>
            <Text className="ml-2 text-[11.5px] font-bold uppercase tracking-widest text-slate-400">Question</Text>
          </View>

          <View className={`flex-row items-center rounded-full border px-2.5 py-1 ${s.badge}`}>
            <Ionicons name={s.icon} size={13} color={s.color} style={{ marginRight: 4 }} />
            <Text className={`text-[11.5px] font-bold ${s.text}`}>{s.label}</Text>
          </View>
        </View>

        <Text className="mb-4 text-[15.5px] font-semibold leading-6 text-white">{item.question}</Text>

        {item.options.map((opt, i) => (
          <OptionRow key={i} text={opt} index={i} userIndex={item.userIndex} correctIndex={item.correctIndex} />
        ))}

        {item.status === "skipped" && (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="information-circle-outline" size={15} color="#94A3B8" />
            <Text className="ml-1.5 text-[12px] text-slate-400">You didn't answer this question.</Text>
          </View>
        )}

        {!!item.explanation && (
          <View className="mt-3 rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-3.5">
            <View className="mb-1.5 flex-row items-center">
              <Ionicons name="bulb" size={15} color="#A5B4FC" style={{ marginRight: 6 }} />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Explanation</Text>
            </View>
            <Text className="text-[13px] leading-5 text-indigo-100/90">{item.explanation}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ───────────────────────── Screen ───────────────────────── */

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");

  const { practiceQuestions, currentCourses, userAnswers } = UsePracticeStore();
  const result = useMemo(() => evaluateQuiz(practiceQuestions, userAnswers), [practiceQuestions, userAnswers]);

  const list = useMemo(
    () => (filter === "all" ? result.items : result.items.filter((i) => i.status === filter)),
    [result, filter]
  );

  const tabs = [
    { key: "all", label: "All", count: result.total, active: "bg-indigo-500 border-indigo-500" },
    { key: "correct", label: "Correct", count: result.correct, active: "bg-emerald-500 border-emerald-500" },
    { key: "wrong", label: "Wrong", count: result.wrong, active: "bg-red-500 border-red-500" },
    { key: "skipped", label: "Skipped", count: result.skipped, active: "bg-slate-500 border-slate-500" },
  ];

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
        {/* header */}
        <View className="flex-row items-center px-5 pb-3 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 active:bg-white/20"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-[18px] font-bold text-white">Review Answers</Text>
            <Text className="text-[12px] text-slate-400" numberOfLines={1}>
              {currentCourses || "TechQuiz"} · {result.correct}/{result.total} correct
            </Text>
          </View>
        </View>

        {/* filter tabs */}
        <View className="flex-row px-4 pb-3">
          {tabs.map((t) => {
            const on = filter === t.key;
            return (
              <Pressable
                key={t.key}
                // onPress={() => setFilter(t.key)}
                className={`mx-1 flex-1 items-center rounded-xl border py-2.5 ${
                  on ? t.active : "border-white/10 bg-white/[0.05]"
                }`}
              >
                <Text className={`text-[12px] font-bold ${on ? "text-white" : "text-slate-300"}`}>
                  {t.label} <Text className={on ? "text-white/80" : "text-slate-500"}>{t.count}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id ?? item.number)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => <QuestionCard item={item} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="document-text-outline" size={46} color="#475569" />
              <Text className="mt-3 text-[14.5px] text-slate-400">No questions in this filter.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}