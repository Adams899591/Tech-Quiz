import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

import { UsePracticeStore } from "../../zustand/StorePraticalQuestions";
import { CATEGORIES } from "../js/categories"; // adjust the path if needed
import { evaluateQuiz } from "../../components/evaluateQuiz";
import { getQuestions } from "../js/questionBank";

const TOTAL_QUIZ_TIME = 15 * 60; // keep in sync with the quiz screen
const HOME_ROUTE = "/screen/home";
const REVIEW_ROUTE = "/screen/review-answers-screen";
const QUIZ_ROUTE = "/screen/quiz-screen";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 200;
const RING_STROKE = 14;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// verdict + colours depending on the score
function tierFor(percentage) {
  if (percentage >= 80)
    return { title: "Excellent work!", note: "You really know this topic.", colors: ["#22D3EE", "#10B981"], icon: "trophy" };
  if (percentage >= 50)
    return { title: "Good job!", note: "Solid result. A little more practice and you're there.", colors: ["#818CF8", "#A78BFA"], icon: "thumbs-up" };
  return { title: "Keep practising", note: "Review your answers and try again. You'll improve fast.", colors: ["#FBBF24", "#F87171"], icon: "barbell" };
}

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function StatCard({ icon, color, bg, value, label }) {
  return (
    <View className="mx-1 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.05] py-4">
      <View style={{ backgroundColor: bg }} className="mb-2 h-9 w-9 items-center justify-center rounded-full">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-[20px] font-extrabold text-white">{value}</Text>
      <Text className="mt-0.5 text-[11.5px] text-slate-400">{label}</Text>
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { practiceQuestions, currentCourses, userAnswers, startTime, setPracticeData, clearPracticeData } =
    UsePracticeStore();

  const hasQuestions = !!practiceQuestions && practiceQuestions.length > 0;

  const result = useMemo(() => evaluateQuiz(practiceQuestions, userAnswers), [practiceQuestions, userAnswers]);
  const tier = tierFor(result.percentage);

  const category = CATEGORIES.find((c) => c.title === currentCourses);
  const bank = category ? getQuestions(category.id) : [];

  // time taken (measured once, when the result screen opens)
  const openedAt = useRef(Date.now()).current;
  const timeTaken = startTime
    ? Math.min(TOTAL_QUIZ_TIME, Math.max(0, Math.floor((openedAt - startTime) / 1000)))
    : null;

  /* ── animated ring + counting number ── */
  const progress = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!hasQuestions) return;
    const id = progress.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(progress, {
      toValue: result.percentage,
      duration: 1300,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // svg props can't use the native driver
    }).start();
    return () => progress.removeListener(id);
  }, [hasQuestions, result.percentage]);

  const dashOffset = progress.interpolate({ inputRange: [0, 100], outputRange: [CIRCUMFERENCE, 0] });

  const handleRetry = () => {
    clearPracticeData();
    setPracticeData(bank, currentCourses); // a brand-new random set
    router.replace(QUIZ_ROUTE);
  };

  if (!hasQuestions) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030A22] px-8">
        <StatusBar style="light" />
        <Ionicons name="stats-chart-outline" size={46} color="#64748B" />
        <Text className="mt-3 text-center text-[16px] text-slate-300">No results to show yet.</Text>
        <Pressable onPress={() => router.replace(HOME_ROUTE)} className="mt-5 rounded-2xl bg-indigo-500 px-6 py-3">
          <Text className="font-bold text-white">Back to categories</Text>
        </Pressable>
      </View>
    );
  }

  const [c1, c2] = category ? category.colors : ["#6366F1", "#8B5CF6"];

  return (
    <View className="flex-1 bg-[#030A22]">
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0B1B5C", "#050E34", "#030A22"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        style={{
          position: "absolute",
          top: -80,
          alignSelf: "center",
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: tier.colors[0],
          opacity: 0.12,
        }}
      />

      <SafeAreaView edges={["top"]} className="flex-1">
        {/* top bar */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
          <Text className="text-[18px] font-bold text-white">Quiz Results</Text>
          <Pressable
            onPress={() => router.replace(HOME_ROUTE)}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 active:bg-white/20"
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        >
          {/* score ring */}
          <View className="items-center pt-4">
            <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" }}>
              <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: "absolute" }}>
                <Defs>
                  <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={tier.colors[0]} />
                    <Stop offset="1" stopColor={tier.colors[1]} />
                  </SvgGradient>
                </Defs>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="url(#ring)"
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                  fill="none"
                />
              </Svg>

              <Text className="text-[46px] font-extrabold tracking-tight text-white">{shown}%</Text>
              <Text className="-mt-1 text-[13px] text-slate-400">
                {result.correct} of {result.total} correct
              </Text>
            </View>

            <View className="mt-5 flex-row items-center">
              <Ionicons name={tier.icon} size={20} color={tier.colors[0]} />
              <Text className="ml-2 text-[24px] font-extrabold text-white">{tier.title}</Text>
            </View>
            <Text className="mt-1.5 px-6 text-center text-[14px] leading-5 text-slate-300">{tier.note}</Text>
          </View>

          {/* stats */}
          <View className="mt-7 flex-row">
            <StatCard icon="checkmark" color="#34D399" bg="rgba(52,211,153,0.15)" value={result.correct} label="Correct" />
            <StatCard icon="close" color="#F87171" bg="rgba(248,113,113,0.15)" value={result.wrong} label="Wrong" />
            <StatCard icon="remove" color="#94A3B8" bg="rgba(148,163,184,0.15)" value={result.skipped} label="Skipped" />
          </View>

          {/* category + details */}
          <Text className="mb-3 mt-8 text-[12px] font-bold uppercase tracking-widest text-slate-400">Summary</Text>
          <View className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <View className="flex-row items-center">
              <LinearGradient
                colors={[c1, c2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name={category ? category.icon : "school"} size={22} color="#fff" />
              </LinearGradient>
              <View className="ml-3.5 flex-1">
                <Text className="text-[15.5px] font-bold text-white" numberOfLines={1}>
                  {currentCourses || "TechQuiz"}
                </Text>
                <Text className="mt-0.5 text-[12.5px] text-slate-400">
                  {result.correct} / {result.total} correct
                </Text>
              </View>
              <Text className="text-[18px] font-extrabold text-white">{result.percentage}%</Text>
            </View>

            <View className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <LinearGradient
                colors={[c1, c2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${result.percentage}%`, height: "100%", borderRadius: 999 }}
              />
            </View>

            <View className="mt-4 flex-row border-t border-white/10 pt-4">
              <View className="flex-1 flex-row items-center">
                <Ionicons name="time-outline" size={18} color="#94A3B8" />
                <View className="ml-2.5">
                  <Text className="text-[11px] text-slate-500">Time taken</Text>
                  <Text className="text-[14px] font-bold text-white">
                    {timeTaken === null ? "--:--" : formatTime(timeTaken)}
                  </Text>
                </View>
              </View>
              <View className="flex-1 flex-row items-center">
                <Ionicons
                  name={result.passed ? "shield-checkmark-outline" : "shield-outline"}
                  size={18}
                  color={result.passed ? "#34D399" : "#94A3B8"}
                />
                <View className="ml-2.5">
                  <Text className="text-[11px] text-slate-500">Pass mark 50%</Text>
                  <Text className={`text-[14px] font-bold ${result.passed ? "text-emerald-400" : "text-slate-300"}`}>
                    {result.passed ? "Passed" : "Not yet"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* actions */}
        <View
          className="border-t border-white/10 bg-[#030A22]/95 px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <Pressable onPress={() => router.push(REVIEW_ROUTE)} className="active:opacity-85">
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 50,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#6366F1",
                shadowOpacity: 0.45,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <Ionicons name="eye-outline" size={19} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-[15px] font-bold text-white">Review Answers</Text>
            </LinearGradient>
          </Pressable>

          <View className="mt-3 flex-row">
            {bank.length > 0 && (
              <Pressable
                onPress={handleRetry}
                className="mr-3 h-12 flex-1 flex-row items-center justify-center rounded-2xl border border-white/20 bg-white/5 active:bg-white/15"
              >
                <Ionicons name="refresh" size={18} color="#E2E8F0" style={{ marginRight: 6 }} />
                <Text className="text-[14px] font-bold text-slate-200">Try Again</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => router.replace(HOME_ROUTE)}
              className="h-12 flex-1 flex-row items-center justify-center rounded-2xl border border-white/20 bg-white/5 active:bg-white/15"
            >
              <Ionicons name="home-outline" size={18} color="#E2E8F0" style={{ marginRight: 6 }} />
              <Text className="text-[14px] font-bold text-slate-200">Home</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}







