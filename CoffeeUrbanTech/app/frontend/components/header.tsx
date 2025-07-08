import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width: screenW } = Dimensions.get("window");

// =============================
// Componente de onda animada
const AnimatedPath = Animated.createAnimatedComponent(Path);

function MovingWave() {
  const { width: screenW } = Dimensions.get("window");
  const height = 59;
  const amplitude = 10; // Profundidad de la onda
  const frequency = 1; // Número de ondas completas en el ancho
  const points = 200; // Más puntos = onda más suave

  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
        withTiming(2 * Math.PI, { duration: 4000 }),
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
          Math.sin(frequency * 2 * Math.PI * (i / points) + offset.value);
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
          <AnimatedPath animatedProps={animatedProps} fill="#f5f5f4" />
        </Svg>
      </View>
  );
}

export default function SimpleHeader() {
  return (
      <View className="w-full bg-white shadow-md overflow-hidden">
        <View className="relative">
          <LinearGradient
              colors={["#D17F45", "#914E31", "#8B4513"]}
              className="px-4 py-1 items-center"
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 1 }}>
              <Image
                  source={require("../../../assets/images/java.png")}
                  style={{ width: 150, height: 150, marginRight: 16 }}
                  resizeMode="contain"
              />
              <View>
                <Text className="text-white text-[26px] font-extrabold tracking-tight">
                  Coffee UrbanTech
                </Text>
                <Text className="text-white text-sm opacity-80 font-light">
                  Gestión inteligente para tu restaurante
                </Text>
              </View>
            </View>
          </LinearGradient>
          <MovingWave />
        </View>
      </View>
  );
}