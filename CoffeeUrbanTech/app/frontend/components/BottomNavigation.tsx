import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const DashboardIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
            fill={color}
        />
    </Svg>
);

const SalesIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
            fill={color}
        />
    </Svg>
);

const InventoryIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.42.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z"
            fill={color}
        />
    </Svg>
);

const PurchasesIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M19 7h-2V6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V6zm8 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10z"
            fill={color}
        />
    </Svg>
);

const UsersIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            fill={color}
        />
    </Svg>
);

const ReportsIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
            fill={color}
        />
    </Svg>
);

const tabs = [
    { id: "dashboard", label: "Inicio", icon: DashboardIcon },
    { id: "ventas", label: "Ventas", icon: SalesIcon },
    { id: "inventario", label: "Inventario", icon: InventoryIcon },
    { id: "compras", label: "Compras", icon: PurchasesIcon },
    { id: "usuarios", label: "Usuarios", icon: UsersIcon },
    { id: "reportes", label: "Reportes", icon: ReportsIcon },
];

const AnimatedPath = Animated.createAnimatedComponent(Path);

function MovingWave() {
    const { width: screenW } = Dimensions.get("window");
    const height = 59;
    const amplitude = 10; // Profundidad de la onda
    const frequency = 1; // Número de ondas completas en el ancho

    const points = Math.max(100, Math.min(300, screenW / 2)); // Densidad adaptativa

    const offset = useSharedValue(0);

    useEffect(() => {
        offset.value = withRepeat(
            withTiming(2 * Math.PI, { duration: 4000 }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        'worklet';

        let path = `M0,${height / 2}`;

        const step = screenW / points;

        for (let i = 0; i <= points; i++) {
            const x = i * step;
            const normalizedX = x / screenW;

            const y = height / 2 +
                amplitude * Math.sin(frequency * 2 * Math.PI * normalizedX + offset.value);

            path += ` L${x},${y}`;
        }

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
                    fill="rgba(255, 255, 255, 0.9)"
                />
            </Svg>
        </View>
    );
}


type Props = {
    onTabChange?: (tabId: string) => void;
};

export function BottomNavigation({onTabChange}: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const scaleValues = tabs.map(() => useSharedValue(1));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const translateYValues = tabs.map(() => useSharedValue(0));

    const onTabPress = (idx: number) => {
        setActiveIndex(idx);

        scaleValues[idx].value = withSpring(1.1, {damping: 15});
        translateYValues[idx].value = withSpring(-2, {damping: 15});

        scaleValues.forEach((scale, i) => {
            if (i !== idx) {
                scale.value = withSpring(1, {damping: 15});
                translateYValues[i].value = withSpring(0, {damping: 15});
            }
        });

        const route = "/" + tabs[idx].id;
        router.replace(route as any);
        onTabChange?.(tabs[idx].id);
    };

    return (
        <View
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "transparent",
                paddingBottom: Platform.OS === "ios" ? 34 : 0,
            }}
        >
            <View style={{backgroundColor: "white", overflow: "hidden"}}>

                <MovingWave/>

                <LinearGradient
                    colors={["#fafafa", "#ffffff"]}
                    style={{
                        paddingTop: 15,
                        paddingBottom: 15,
                        paddingHorizontal: 8,
                    }}
                >
                    <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                        {tabs.map((tab, idx) => {
                            const isActive = activeIndex === idx;
                            const IconComponent = tab.icon;

                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const animatedStyle = useAnimatedStyle(() => ({
                                transform: [
                                    {scale: scaleValues[idx].value},
                                    {translateY: translateYValues[idx].value},
                                ],
                            }));

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => onTabPress(idx)}
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingVertical: 6,
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Animated.View
                                        style={[
                                            {
                                                alignItems: "center",
                                                justifyContent: "center",
                                                paddingHorizontal: 0,
                                                paddingVertical: 6,
                                                borderRadius: 16,
                                                backgroundColor: "transparent",
                                                minWidth: 50,
                                            },
                                            animatedStyle,
                                        ]}
                                    >
                                        <IconComponent
                                            color={isActive ? "#8B4513" : "#666666"}
                                            size={20}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: isActive ? "600" : "400",
                                                color: isActive ? "#8B4513" : "#666666",
                                                marginTop: 2,
                                                textAlign: "center",
                                            }}
                                        >
                                            {tab.label}
                                        </Text>
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}