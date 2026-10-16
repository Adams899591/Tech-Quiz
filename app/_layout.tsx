import { Stack } from "expo-router";
import "../global.css"; // Note:    This should always be on your layout
import { useEffect, useState } from "react";
import { SafeAreaProvider} from "react-native-safe-area-context";
import * as Updates from 'expo-updates';

export default function RootLayout() {

  const onCheckForUpdates = async () => {
    // Skip checking if running locally in development
    if (__DEV__) return;
    try {
      // 1. Check if a new update exists on the server
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // 2. Download the update if available
        await Updates.fetchUpdateAsync();
        
        // 3. Restart the app to load the new update
        await Updates.reloadAsync();
      } else {
        // alert('No new updates available.');
      }
    } catch (error) {
      // Handle error (e.g., device is offline)
      // alert(`Error fetching latest update: ${error.message}`);
    }
  };


  useEffect(() => {
    onCheckForUpdates();
  }, []);

  return (
  
       <SafeAreaProvider> 
           <Stack screenOptions={{headerShown: false}} />
        </SafeAreaProvider> 
  
  );
}
