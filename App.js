import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";//notch   
import { NavigationContainer } from "@react-navigation/native";// app navigation control
import { AuthProvider } from "./src/context/AuthContext";// provides authentication data to app 
import AppNavigator from "./src/navigation/AppNavigator";// decide whom to show employee or employer 

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
