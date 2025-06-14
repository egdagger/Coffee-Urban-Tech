// Header.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const tabs = ["Dashboard", "Ventas", "Inventario", "Compras", "Reportes"];

const AnimatedView = Animated.createAnimatedComponent(View);

const { width: screenW } = Dimensions.get("window");

// =============================
// Componente de onda animada
const AnimatedPath = Animated.createAnimatedComponent(Path);

function MovingWave() {
  const { width: screenW } = Dimensions.get("window");
  const height = 36;
  const amplitude = 12; // Profundidad de la onda
  const frequency = 2; // Número de ondas completas en el ancho
  const points = 80; // Más puntos = onda más suave

  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 3500 }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    // Genera los puntos de la onda
    let path = `M0,${height / 2}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * screenW;
      const y =
        height / 2 +
        amplitude *
          Math.sin(
            frequency * 2 * Math.PI * (i / points) + offset.value
          );
      path += ` L${x},${y}`;
    }
    // Cierra el path para rellenar debajo de la onda
    path += ` L${screenW},${height} L0,${height} Z`;
    return { d: path };
  });

  return (
    <View
      style={{
        width: screenW,
        height,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
      }}
    >
      <Svg width={screenW} height={height}>
        <AnimatedPath
          animatedProps={animatedProps}
          fill="#f5f5f4"
        />
      </Svg>
    </View>
  );
}

// =============================
// Componente Header principal
// =============================
type Props = {
  onTabChange?: (tabId: string) => void;
};

export default function Header({ onTabChange }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const handleTabLayout = (e: LayoutChangeEvent, idx: number) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[idx] = { x, width };
    if (idx === activeIndex) {
      indicatorX.value = withTiming(x, { duration: 250 });
      indicatorWidth.value = withTiming(width, { duration: 250 });
    }
  };

  const onTabPress = (idx: number) => {
    setActiveIndex(idx);
    const layout = tabLayouts.current[idx];
    if (layout) {
      indicatorX.value = withTiming(layout.x, { duration: 300 });
      indicatorWidth.value = withTiming(layout.width, { duration: 300 });
    }
    onTabChange?.(tabs[idx].toLowerCase());
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View className="w-full bg-white shadow-md  overflow-hidden">
      <View className="relative">
        <LinearGradient
          colors={["#6A4E37", "#8B4513", "#D2B48C"]}
          className="px-6 py-8 items-center "
        >
          <Text className="text-white text-[26px] font-extrabold tracking-tight mb-1">
            ☕ Coffee UrbanTech
          </Text>
          <Text className="text-white text-sm opacity-80 font-light">
            Gestión inteligente para tu restaurante
          </Text>
        </LinearGradient>

        {/* Aquí va la onda animada */}
        <MovingWave />
      </View>

      {/* Selector tipo segmented */}
      <View className="bg-[#f5f5f4] px-4 pt-6 pb-4">
        <View className="flex-row bg-white rounded-full p-1 shadow-md relative overflow-hidden">
          <Animated.View
            className="absolute top-1 bottom-1 bg-[#8B4513] rounded-full"
            style={animatedIndicatorStyle}
          />

          {tabs.map((tab, idx) => {
            const isActive = activeIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => onTabPress(idx)}
                onLayout={(e) => handleTabLayout(e, idx)}
                className="flex-1 items-center justify-center px-3 py-2 z-10"
              >
                <Text
                  className={`text-[13px] font-medium ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
