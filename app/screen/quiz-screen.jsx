import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { UsePracticeStore } from "../../zustand/StorePraticalQuestions";
import { CATEGORIES } from "../js/categories"; // adjust the path if needed

const TOTAL_QUIZ_TIME = 15 * 60; // 15 minutes, in seconds
const CRITICAL_TIME = 5 * 60; // timer turns red at 5 minutes left
const RESULT_ROUTE = "/screen/result-screen";
const HOME_ROUTE = "/home"; // where "Back to categories" goes

const letterFor = (i) => String.fromCharCode(65 + i); // 0 -> A, 1 -> B ...

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { practiceQuestions, currentCourses, userAnswers, startTime, setUserAnswer } =
    UsePracticeStore();

  const hasQuestions = !!practiceQuestions && practiceQuestions.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME);

  // ── Modal Visibility States (replaces Alert.alert) ──
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const scrollRef = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;

  // category chosen on the Home screen (saved in the store as currentCourses)
  const category = CATEGORIES.find((c) => c.title === currentCourses);
  const accent = category ? category.colors[0] : "#6366F1";

  /* ── Timer: counts from the store's startTime, so it stays correct even if the app was in the background ── */
  useEffect(() => {
    if (!hasQuestions) return;
    const start = startTime || Date.now();

    const tick = () => {
      const left = Math.max(0, TOTAL_QUIZ_TIME - Math.floor((Date.now() - start) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(id);
        router.replace(RESULT_ROUTE);
      }
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [hasQuestions, startTime]);

  /* ── Progress bar animation + scroll to top on every new question ── */
  useEffect(() => {
    if (!hasQuestions) return;
    Animated.timing(progress, {
      toValue: (currentIndex + 1) / practiceQuestions.length,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width can't use the native driver
    }).start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex, hasQuestions]);

  /* ── No questions (e.g. screen opened directly) ── */
  if (!hasQuestions) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030A22] px-8">
        <StatusBar style="light" />
        <Ionicons name="help-circle-outline" size={46} color="#64748B" />
        <Text className="mt-3 text-center text-[16px] text-slate-300">
          No quiz is running. Pick a category to start one.
        </Text>
        <Pressable
          onPress={() => router.replace(HOME_ROUTE)}
          className="mt-5 rounded-2xl bg-indigo-500 px-6 py-3 active:opacity-85"
        >
          <Text className="font-bold text-white">Back to categories</Text>
        </Pressable>
      </View>
    );
  }

  const total = practiceQuestions.length;
  const currentQuestion = practiceQuestions[currentIndex];
  const selected = userAnswers[currentQuestion.id] ?? null;
  const answeredCount = practiceQuestions.filter((q) => userAnswers[q.id] !== undefined).length;
  const isLast = currentIndex === total - 1;
  const critical = timeLeft <= CRITICAL_TIME;

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  // ── Finish Logic: Opens custom modal if there are unanswered questions ──
  const finish = () => {
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      setFinishModalVisible(true);
    } else {
      router.replace(RESULT_ROUTE);
    }
  };

  const handleNext = () => (isLast ? finish() : setCurrentIndex((i) => i + 1));
  const handlePrevious = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  // ── Exit Logic: Opens custom exit warning modal ──
  const handleExit = () => setExitModalVisible(true);

  const unansweredCount = total - answeredCount;

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
        {/* ── header ── */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Pressable
            onPress={handleExit}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 active:bg-white/20"
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>

          <View className="mx-3 flex-1 flex-row items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
            <View style={{ backgroundColor: accent }} className="mr-2 h-2 w-2 rounded-full" />
            <Text className="flex-shrink text-[12px] font-bold text-slate-200" numberOfLines={1}>
              {currentCourses || "TechQuiz"}
            </Text>
          </View>

          <View
            className={`flex-row items-center rounded-2xl border px-3 py-2 ${
              critical ? "border-red-400/40 bg-red-500/15" : "border-white/10 bg-white/[0.06]"
            }`}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={critical ? "#F87171" : "#CBD5E1"}
              style={{ marginRight: 5 }}
            />
            <Text className={`text-[12.5px] font-extrabold ${critical ? "text-red-400" : "text-slate-200"}`}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* ── progress ── */}
        <View className="px-5">
          <View className="h-2 overflow-hidden rounded-full bg-white/10">
            <Animated.View style={{ width: barWidth, height: "100%", borderRadius: 999 }}>
              <LinearGradient
                colors={["#22D3EE", "#6366F1", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>
          <View className="mt-2.5 flex-row items-center justify-between">
            <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
              Question {currentIndex + 1} of {total}
            </Text>
            <Text className="text-[12px] text-slate-500">
              {answeredCount}/{total} answered
            </Text>
          </View>
        </View>

        {/* ── question + options ── */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 }}
        >
          <View className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            {!!currentQuestion.topic && (
              <View className="mb-3 self-start rounded-md bg-indigo-500/20 px-2.5 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                  {currentQuestion.topic}
                </Text>
              </View>
            )}
            <Text className="text-[18px] font-bold leading-7 text-white">{currentQuestion.question}</Text>
          </View>

          <View className="mt-4">
            {currentQuestion.options.map((optionText, index) => {
              const isSelected = selected === index;
              return (
                <Pressable
                  key={`${currentQuestion.id}-${index}`}
                  onPress={() => setUserAnswer(currentQuestion.id, index)}
                  className={`mb-3 flex-row items-center rounded-2xl border p-3.5 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-500/20"
                      : "border-white/10 bg-white/[0.05] active:bg-white/10"
                  }`}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={["#6366F1", "#8B5CF6"]}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text className="text-[14px] font-extrabold text-white">{letterFor(index)}</Text>
                    </LinearGradient>
                  ) : (
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <Text className="text-[14px] font-extrabold text-slate-300">{letterFor(index)}</Text>
                    </View>
                  )}

                  <Text
                    className={`ml-3.5 flex-1 text-[14.5px] leading-5 ${
                      isSelected ? "font-bold text-white" : "font-medium text-slate-200"
                    }`}
                  >
                    {optionText}
                  </Text>

                  <View
                    className={`ml-2 h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-indigo-400 bg-indigo-500" : "border-white/25"
                    }`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ── bottom bar ── */}
        <View
          className="flex-row items-center border-t border-white/10 bg-[#030A22]/95 px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <Pressable
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            className="h-12 w-28 flex-row items-center justify-center rounded-2xl border border-white/20 bg-white/5 active:bg-white/15"
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#E2E8F0" style={{ marginRight: 6 }} />
            <Text className="text-[14px] font-bold text-slate-200">Previous</Text>
          </Pressable>

          <Pressable onPress={handleNext} className="ml-4 flex-1 active:opacity-85">
            <LinearGradient
              colors={isLast ? ["#22C55E", "#10B981"] : ["#6366F1", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 48,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isLast ? "#22C55E" : "#6366F1",
                shadowOpacity: 0.45,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <Text className="mr-2 text-[14.5px] font-bold text-white">
                {isLast ? "Finish" : "Next Question"}
              </Text>
              <Ionicons
                name={isLast ? "checkmark-circle-outline" : "arrow-forward-outline"}
                size={18}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CUSTOM MODAL: FINISH QUIZ WARNING                            */}
        {/* ───────────────────────────────────────────────────────────── */}
        <Modal
          visible={finishModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFinishModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0B1536] p-6 shadow-2xl">
              {/* Icon Header */}
              <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20">
                <Ionicons name="alert-circle-outline" size={26} color="#FBBF24" />
              </View>

              <Text className="text-xl font-bold text-white">Finish quiz?</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300">
                You still have <Text className="font-bold text-amber-400">{unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}</Text>. Are you sure you want to finish now?
              </Text>

              {/* Action Buttons */}
              <View className="mt-6 flex-row space-x-3">
                <Pressable
                  onPress={() => setFinishModalVisible(false)}
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3.5 active:bg-white/10"
                >
                  <Text className="text-center font-bold text-slate-200">Keep going</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setFinishModalVisible(false);
                    router.replace(RESULT_ROUTE);
                  }}
                  className="flex-1 rounded-2xl bg-amber-500 py-3.5 active:opacity-85"
                >
                  <Text className="text-center font-bold text-slate-950">Finish</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CUSTOM MODAL: LEAVE QUIZ WARNING                             */}
        {/* ───────────────────────────────────────────────────────────── */}
        <Modal
          visible={exitModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setExitModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-sm overflow-hidden rounded-3xl border border-red-500/30 bg-[#0B1536] p-6 shadow-2xl">
              {/* Icon Header */}
              <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20">
                <Ionicons name="warning-outline" size={26} color="#F87171" />
              </View>

              <Text className="text-xl font-bold text-white">Leave the quiz?</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300">
                Your progress will be interrupted and your answers will be lost.
              </Text>

              {/* Action Buttons */}
              <View className="mt-6 flex-row space-x-3">
                <Pressable
                  onPress={() => setExitModalVisible(false)}
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3.5 active:bg-white/10"
                >
                  <Text className="text-center font-bold text-slate-200">Stay</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setExitModalVisible(false);
                    router.back();
                  }}
                  className="flex-1 rounded-2xl bg-red-500 py-3.5 active:opacity-85"
                >
                  <Text className="text-center font-bold text-white">Leave</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}