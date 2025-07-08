import {Stack} from "expo-router";
import {SafeAreaView, View} from "react-native";
import SimpleHeader from "./frontend/components/header";
import {BottomNavigation} from "./frontend/components/BottomNavigation";
import "./global.css";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{headerShown: false}}
            layout={({children}) => (
                <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>

                    <SimpleHeader/>


                    <View style={{
                        flex: 1,
                        paddingBottom: 75
                    }}>
                        {children}
                    </View>


                    <BottomNavigation
                        onTabChange={(tabId) => {
                            console.log("Tab changed:", tabId);
                        }}
                    />
                </SafeAreaView>
            )}
        >
            <Stack.Screen name="index"/>
            <Stack.Screen name="dashboard"/>
            <Stack.Screen name="ventas"/>
            <Stack.Screen name="inventario"/>
            <Stack.Screen name="compras"/>
            <Stack.Screen name="usuarios"/>
            <Stack.Screen name="reportes"/>
        </Stack>
    );
}