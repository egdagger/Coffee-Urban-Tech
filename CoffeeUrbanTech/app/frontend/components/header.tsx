import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useRef } from "react";

import {
    Dimensions,
    Image,
    Text,
    View,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Platform,
    StatusBar,
} from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useUser } from "../../context/UserContext";
import { router } from "expo-router";

const { width: screenW } = Dimensions.get("window");

const isSmallScreen = screenW < 400;
const isLargeScreen = screenW >= 768;

const UserIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill={color}
        />
    </Svg>
);

const ChevronDownIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 10l5 5 5-5z" fill={color} />
    </Svg>
);

const LogoutIcon = ({ color = "#666", size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
            fill={color}
        />
    </Svg>
);

const AnimatedPath = Animated.createAnimatedComponent(Path);

function MovingWave() {
    const height = 80;
    const amplitude = 10;
    const frequency = 1;
    const points = 200;

    const offset = useSharedValue(0);

    useEffect(() => {
        offset.value = withRepeat(
            withTiming(2 * Math.PI, { duration: 4000 }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        let path = `M0,${height / 2}`;
        for (let i = 0; i <= points; i++) {
            const x = (i / points) * screenW;
            const y =
                height / 2 +
                amplitude * Math.sin(frequency * 2 * Math.PI * (i / points) + offset.value);
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
                <AnimatedPath animatedProps={animatedProps} fill="#ffffff" />
            </Svg>
        </View>
    );
}

// @ts-ignore
const ConfirmationModal = ({ visible, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar" }) => {
    const scaleValue = useSharedValue(0);
    const opacityValue = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scaleValue.value = withSpring(1, { damping: 15, stiffness: 150 });
            opacityValue.value = withTiming(1, { duration: 200 });
        } else {
            scaleValue.value = withSpring(0, { damping: 15, stiffness: 150 });
            opacityValue.value = withTiming(0, { duration: 150 });
        }
    }, [visible]);

    const animatedModalStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
            opacity: opacityValue.value,
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value,
        };
    });

    if (!visible) return null;

    return (
        <View style={styles.confirmationOverlay}>
            <Animated.View style={[styles.confirmationBackdrop, backdropStyle]}>
                <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
            </Animated.View>

            <Animated.View style={[styles.confirmationModal, animatedModalStyle]}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

// @ts-ignore
const UserDropdownMenu = ({ visible, onClose, userName, onLogout, buttonRef }) => {
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const scaleValue = useSharedValue(0);
    const opacityValue = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            if (buttonRef?.current) {
                buttonRef.current.measure((x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
                    setButtonLayout({ x: pageX, y: pageY, width, height });
                });
            }

            scaleValue.value = withSpring(1, { damping: 15, stiffness: 150 });
            opacityValue.value = withTiming(1, { duration: 200 });
        } else {
            scaleValue.value = withSpring(0, { damping: 15, stiffness: 150 });
            opacityValue.value = withTiming(0, { duration: 150 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scaleValue.value },
                { translateY: -10 * (1 - scaleValue.value) }
            ],
            opacity: opacityValue.value,
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value,
        };
    });

    if (!visible) return null;

    const menuTop = buttonLayout.y + buttonLayout.height + 8;
    const menuRight = screenW - buttonLayout.x - buttonLayout.width;

    return (
        <View style={styles.overlayContainer}>
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.dropdownMenu,
                    {
                        top: menuTop,
                        right: menuRight,
                    },
                    animatedStyle,
                ]}
            >
                <View style={styles.userInfo}>
                    <View style={styles.userRow}>
                        <UserIcon color="#8B4513" size={20} />
                        <Text style={styles.userName}>
                            {userName || 'Usuario'}
                        </Text>
                    </View>
                    <Text style={styles.status}>Conectado</Text>
                </View>

                <TouchableOpacity
                    onPress={onLogout}
                    style={styles.logoutBtn}
                    activeOpacity={0.7}
                >
                    <LogoutIcon color="#dc2626" size={20} />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default function HeaderWithUserMenu() {
    const { user, logout } = useUser();
    const [menuVisible, setMenuVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const buttonRef = useRef(null);

    const handleLogout = () => {
        setConfirmationVisible(true);
    };

    const confirmLogout = async () => {
        setConfirmationVisible(false);
        setMenuVisible(false);
        await logout();
        router.replace('/login');
    };

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={["#D17F45", "#914E31", "#8B4513"]}
                        style={styles.gradient}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerRow}>
                                <Image
                                    source={require("../../../assets/images/java.png")}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.title}>Coffee UrbanTech</Text>
                                <TouchableOpacity
                                    ref={buttonRef}
                                    style={styles.userButton}
                                    onPress={toggleMenu}
                                    activeOpacity={0.7}
                                >
                                    <UserIcon color="white" size={20} />
                                    <ChevronDownIcon color="white" size={16} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                    <MovingWave />
                </View>
            </View>

            <UserDropdownMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                userName={user?.name || user?.email || 'Usuario'}
                onLogout={handleLogout}
                buttonRef={buttonRef}
            />

            <ConfirmationModal
                visible={confirmationVisible}
                onClose={() => setConfirmationVisible(false)}
                onConfirm={confirmLogout}
                title="Cerrar sesión"
                message="¿Estás seguro que deseas cerrar sesión?"
                confirmText="Cerrar sesión"
                cancelText="Cancelar"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    headerContainer: {
        position: 'relative',
    },
    gradient: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
        paddingBottom: 48,
        alignItems: 'center',
    },
    headerContent: {
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 4,
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.5,
        flex: 1,
        textAlign: 'left',
    },
    userButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        justifyContent: 'center',
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'box-none',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 8,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1001,
    },
    userInfo: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        marginLeft: 28,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '500',
    },
    confirmationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    confirmationBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    confirmationModal: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: isSmallScreen ? 16 : 20,
        maxWidth: isLargeScreen ? 400 : '90%',
        width: isLargeScreen ? 400 : '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 2001,
    },
    modalContent: {
        padding: isSmallScreen ? 16 : 24,
    },
    modalTitle: {
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 8 : 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: isSmallScreen ? 14 : 16,
        color: '#666',
        marginBottom: isSmallScreen ? 16 : 24,
        textAlign: 'center',
        lineHeight: isSmallScreen ? 20 : 22,
    },
    modalButtons: {
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: isSmallScreen ? 8 : 12,
    },
    modalButton: {
        flex: isSmallScreen ? 0 : 1,
        paddingVertical: isSmallScreen ? 10 : 12,
        paddingHorizontal: isSmallScreen ? 16 : 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isSmallScreen ? 40 : 44,
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    confirmButton: {
        backgroundColor: '#dc2626',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: '600',
    },
});