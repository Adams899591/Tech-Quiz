import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width: W, height: H } = Dimensions.get("window");

/* ─────────────────────────────────────────────────────────────
   Floating glass tiles (one tech topic each).
   x / y = position as a fraction of the screen (0 to 1)
   driftX / driftY = how far it wanders, tilt = rotation (deg),
   duration = ms for half a loop (bigger = slower)
   ───────────────────────────────────────────────────────────── */
const FLOATERS = [
  { icon: "code-slash", color: "#F59E0B", size: 58, x: 0.07, y: 0.07, driftX: 14, driftY: 22, tilt: 8, duration: 3800, delay: 0 },
  { icon: "phone-portrait", color: "#38BDF8", size: 48, x: 0.74, y: 0.1, driftX: 18, driftY: 16, tilt: 12, duration: 4600, delay: 400 },
  { icon: "shield-checkmark", color: "#34D399", size: 42, x: 0.85, y: 0.37, driftX: 10, driftY: 26, tilt: 10, duration: 5200, delay: 900 },
  { icon: "server", color: "#F472B6", size: 50, x: 0.04, y: 0.63, driftX: 16, driftY: 20, tilt: 9, duration: 4200, delay: 200 },
  { icon: "hardware-chip", color: "#A78BFA", size: 44, x: 0.78, y: 0.74, driftX: 12, driftY: 24, tilt: 14, duration: 4900, delay: 700 },
  { icon: "git-network", color: "#FB7185", size: 38, x: 0.36, y: 0.9, driftX: 20, driftY: 12, tilt: 7, duration: 5600, delay: 1100 },
];

function FloatingTile({ icon, color, size, x, y, driftX, driftY, tilt, duration, delay }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(progress, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
          Animated.timing(progress, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
        ])
      ),
    ]);
    loop.start();
    return () => loop.stop();
  }, [delay, duration, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-driftX, driftX] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [driftY, -driftY] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: [`-${tilt}deg`, `${tilt}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floater,
        {
          left: x * W,
          top: y * H,
          width: size,
          height: size,
          borderRadius: size * 0.3,
          transform: [{ translateX }, { translateY }, { rotate }],
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Animated.View>
  );
}

/* ───────────────────────── Screen ───────────────────────── */

export default function WelcomeGlassScreen() {
  const router = useRouter();

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <View className="flex-1 bg-[#030A22]">
      <StatusBar barStyle="light-content" backgroundColor="#030A22" />

      {/* Background: navy gradient + glowing blobs so the glass has something to blur */}
      <LinearGradient
        colors={["#0B1B5C", "#050E34", "#030A22"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { width: 280, height: 280, top: -80, right: -90, backgroundColor: "rgba(56,189,248,0.28)" }]} />
      <View style={[styles.blob, { width: 340, height: 340, bottom: -120, left: -130, backgroundColor: "rgba(99,102,241,0.38)" }]} />
      <View style={[styles.blob, { width: 160, height: 160, top: H * 0.42, left: W * 0.55, backgroundColor: "rgba(139,92,246,0.22)" }]} />

      {/* Floating topic tiles */}
      {FLOATERS.map((f, i) => (
        <FloatingTile key={i} {...f} />
      ))}

      {/* Glass card */}
      <SafeAreaView className="flex-1 justify-center px-6">
        <Animated.View style={[styles.glassShadow, { opacity: fade, transform: [{ translateY: rise }] }]}>
          <BlurView intensity={50} tint="dark" style={styles.glass}>
            {/* logo tile */}
            <LinearGradient
              colors={["#3B82F6", "#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logo}
            >
              <Ionicons name="bulb" size={34} color="#fff" />
            </LinearGradient>

            <Text className="mt-5 text-center text-[34px] font-extrabold text-white">
              Tech<Text className="text-indigo-400">Quiz</Text>
            </Text>
            <Text className="mt-3 text-center text-[14.5px] leading-6 text-white/75">
              Sharpen your tech skills with quick quizzes on web, mobile, security, AI and more. Learn, practise and train your brain to think fast.
            </Text>

            {/* quick facts */}
            <View style={styles.statsRow}>
              <View className="flex-1 items-center">
                <Text className="text-xl font-extrabold text-white">10+</Text>
                <Text className="mt-0.5 text-[11px] text-white/65">Categories</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Ionicons name="timer-outline" size={22} color="#fff" />
                <Text className="mt-1 text-[11px] text-white/65">Quick quizzes</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Ionicons name="flash-outline" size={22} color="#fff" />
                <Text className="mt-1 text-[11px] text-white/65">Quick thinking</Text>
              </View>
            </View>

            {/* button */}
            <Pressable
              onPress={() => router.replace("/screen/home")} // change to your home route
              className="mt-6 self-stretch active:opacity-85 active:scale-[0.98]"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text className="text-base font-extrabold text-white">Start Learning</Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </LinearGradient>
            </Pressable>
          </BlurView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: "absolute", borderRadius: 999 },
  floater: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  glassShadow: {
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 12,
  },
  glass: {
    borderRadius: 32,
    overflow: "hidden", // so the blur respects the rounded corners
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "rgba(255,255,255,0.07)", // also gives a glass look on Android
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 26,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  divider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.22)" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: "#6366F1",
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});