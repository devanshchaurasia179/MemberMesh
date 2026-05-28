import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* 🔤 FONT IMPORTS */
import { 
  useFonts, 
  Poppins_700Bold 
} from "@expo-google-fonts/poppins";
import { 
  Jost_400Regular, 
  Jost_500Medium, 
  Jost_700Bold 
} from "@expo-google-fonts/jost";

/* PROVIDERS */
import { AuthProvider } from "../providers/AuthProvider";
import AuthGate from "../providers/AuthGate";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [queryClient] = useState(() => new QueryClient()); // ✅ FIX HERE

  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Bold": Poppins_700Bold,
    "Jost-Regular": Jost_400Regular,
    "Jost-Medium": Jost_500Medium,
    "Jost-Bold": Jost_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGate>
            <View style={styles.container} onLayout={onLayoutRootView}>
              <View style={styles.content}>
                <Stack screenOptions={{ headerShown: false }} />
              </View>
            </View>
          </AuthGate>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", 
  },
  content: {
    flex: 1, 
  },
});