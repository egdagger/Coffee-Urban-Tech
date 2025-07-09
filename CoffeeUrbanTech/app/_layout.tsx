import {Stack} from "expo-router";
import {SafeAreaView, View} from "react-native";
import SimpleHeader from "./frontend/components/header";
import {BottomNavigation} from "./frontend/components/BottomNavigation";
import { UserProvider, useUser } from "./context/UserContext";
import "./global.css";
import { ReactNode } from "react";

function AuthenticatedLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <>
            <SimpleHeader />
            <View style={{ flex: 1, paddingBottom: 75 }}>
                {children}
            </View>
            <BottomNavigation
                onTabChange={(tabId) => {
                    console.log("Tab changed:", tabId);
                }}
            />
        </>
    );
}

export default function RootLayout() {
    return (
        <UserProvider>
            <Stack
                screenOptions={{headerShown: false}}
                layout={({children}) => (
                    <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
                        <AuthenticatedLayout>
                            {children}
                        </AuthenticatedLayout>
                    </SafeAreaView>
                )}
            >
                <Stack.Screen name="index"/>
                <Stack.Screen name="login"/>
                <Stack.Screen name="dashboard"/>
                <Stack.Screen name="ventas"/>
                <Stack.Screen name="inventarid"/>
                <Stack.Screen name="compras"/>
                <Stack.Screen name="usuarios"/>
                <Stack.Screen name="reportes"/>
            </Stack>
        </UserProvider>
    );
}