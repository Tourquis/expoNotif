import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Empêcher le splash screen de se fermer automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Initialiser les listeners de notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification reçue:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification ouverte:", response);
    });

    // Cacher le splash screen une fois que tout est prêt
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn("Erreur lors de la fermeture du splash screen:", error);
      }
    };

    // Attendre un peu pour s'assurer que tout est chargé
    const timer = setTimeout(() => {
      hideSplash();
    }, 1000);

    return () => {
      clearTimeout(timer);
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <Stack />;
}
