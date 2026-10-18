import { Stack } from "expo-router";
import "../global.css";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function RootLayout() {

  const onCheckForUpdates = async () => {
    if (__DEV__) return;
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onCheckForUpdates();
  }, []);

  // Ensure root background and Android navigation bar are colored
  useEffect(() => {
    async function configureAndroidBars() {
      if (Platform.OS === 'android') {
        // Set the app window background color
        await SystemUI.setBackgroundColorAsync('#030A22');
        
        // Explicitly style the bottom Android navigation bar
        await NavigationBar.setBackgroundColorAsync('#030A22'); // Blue background for the navigation bar
        await NavigationBar.setButtonStyleAsync('light'); // White icons for dark background
      }
    }

    configureAndroidBars();
  }, []);

  return (
    <SafeAreaProvider> 
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider> 
  );
}