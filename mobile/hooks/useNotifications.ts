import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationToken {
  token: string | null;
  error: string | null;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<NotificationToken>({
    token: null,
    error: null,
  });
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Écouter les notifications reçues pendant que l'app est au premier plan
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Écouter les interactions avec les notifications (quand l'utilisateur appuie dessus)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Demander les permissions et obtenir le token
  const registerForPushNotificationsAsync =
    async (): Promise<NotificationToken> => {
      try {
        // Vérifier si c'est un appareil physique
        if (!Device.isDevice) {
          setExpoPushToken({
            token: null,
            error:
              "Les notifications push ne fonctionnent que sur un appareil physique",
          });
          return {
            token: null,
            error:
              "Les notifications push ne fonctionnent que sur un appareil physique",
          };
        }

        // Demander les permissions
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          setExpoPushToken({
            token: null,
            error: "Permission refusée pour les notifications",
          });
          return {
            token: null,
            error: "Permission refusée pour les notifications",
          };
        }

        // Obtenir le token
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          setExpoPushToken({
            token: null,
            error:
              "Project ID non trouvé. Les notifications push nécessitent un Project ID Expo. Configurez-le dans app.json (voir BUILD_GUIDE.md). Les notifications locales fonctionnent sans Project ID.",
          });
          return {
            token: null,
            error:
              "Project ID non trouvé. Les notifications push nécessitent un Project ID Expo. Configurez-le dans app.json (voir BUILD_GUIDE.md). Les notifications locales fonctionnent sans Project ID.",
          };
        }

        const token = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        setExpoPushToken({ token: token.data, error: null });
        return { token: token.data, error: null };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        setExpoPushToken({
          token: null,
          error: errorMessage,
        });
        return {
          token: null,
          error: errorMessage,
        };
      }
    };

  // Programmer une notification locale
  const scheduleLocalNotification = async (
    title: string,
    body: string,
    seconds: number = 2
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        },
      });
      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: errorMessage };
    }
  };

  // Envoyer une notification immédiate
  const sendImmediateNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null = immédiat
      });
      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: errorMessage };
    }
  };

  // Annuler toutes les notifications programmées
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: errorMessage };
    }
  };

  return {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
    scheduleLocalNotification,
    sendImmediateNotification,
    cancelAllNotifications,
  };
}
