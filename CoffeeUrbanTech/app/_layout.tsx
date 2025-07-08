import { Stack } from "expo-router";
import { SafeAreaView, View } from "react-native";
import SimpleHeader from "./frontend/components/header"; // Header simplificado
import {BottomNavigation} from "./frontend/components/BottomNavigation"; // Navegación inferior
import "./global.css";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{ headerShown: false }}
            layout={({ children }) => (
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    {/* Header simplificado con logo y onda */}
                    <SimpleHeader />

                    {/* Contenido principal con padding bottom para la navegación */}
                    <View style={{
                        flex: 1,
                        paddingBottom: 75 // Reducido de 100 a 75 para la nueva altura
                    }}>
                        {children}
                    </View>

                    {/* Barra de navegación en la parte inferior */}
                    <BottomNavigation
                        onTabChange={(tabId) => {
                            console.log("Tab changed:", tabId);
                            // Aquí puedes agregar lógica adicional si necesitas
                        }}
                    />
                </SafeAreaView>
            )}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="ventas" />
            <Stack.Screen name="inventario" />
            <Stack.Screen name="compras" />
            <Stack.Screen name="usuarios" />
            <Stack.Screen name="reportes" />
        </Stack>
    );
}