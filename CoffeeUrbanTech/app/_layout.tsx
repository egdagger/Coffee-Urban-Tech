import { Stack } from "expo-router";
import { SafeAreaView, View } from "react-native";
import Header from "./frontend/components/header";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      layout={({ children }) => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <Header />

          <View style={{ flex: 1 }}>{children}</View>
        </SafeAreaView>
      )}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="inventory" />
    </Stack>
  );
}
