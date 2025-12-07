import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { useNotifications } from "../hooks/useNotifications";

export default function Index() {
  const {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
    scheduleLocalNotification,
    sendImmediateNotification,
    cancelAllNotifications,
  } = useNotifications();

  const [notificationTitle, setNotificationTitle] = useState("Test Notification");
  const [notificationBody, setNotificationBody] = useState("Ceci est un test de notification");
  const [delaySeconds, setDelaySeconds] = useState("2");

  const handleRegisterToken = async () => {
    const result = await registerForPushNotificationsAsync();
    if (result.token) {
      Alert.alert("Succès", `Token obtenu: ${result.token.substring(0, 50)}...`);
    } else {
      Alert.alert("Erreur", result.error || "Impossible d'obtenir le token");
    }
  };

  const handleSendImmediate = async () => {
    const result = await sendImmediateNotification(notificationTitle, notificationBody);
    if (result.success) {
      Alert.alert("Succès", "Notification envoyée immédiatement");
    } else {
      Alert.alert("Erreur", result.error || "Impossible d'envoyer la notification");
    }
  };

  const handleScheduleNotification = async () => {
    const seconds = parseInt(delaySeconds, 10);
    if (isNaN(seconds) || seconds < 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide de secondes");
      return;
    }

    const result = await scheduleLocalNotification(notificationTitle, notificationBody, seconds);
    if (result.success) {
      Alert.alert("Succès", `Notification programmée dans ${seconds} secondes`);
    } else {
      Alert.alert("Erreur", result.error || "Impossible de programmer la notification");
    }
  };

  const handleCancelAll = async () => {
    const result = await cancelAllNotifications();
    if (result.success) {
      Alert.alert("Succès", "Toutes les notifications programmées ont été annulées");
    } else {
      Alert.alert("Erreur", result.error || "Impossible d'annuler les notifications");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Test des Notifications Expo</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Token Push</Text>
        <TouchableOpacity style={styles.button} onPress={handleRegisterToken}>
          <Text style={styles.buttonText}>Obtenir le Token</Text>
        </TouchableOpacity>

        {expoPushToken.token && (
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Token:</Text>
            <Text style={styles.tokenText} selectable>
              {expoPushToken.token}
            </Text>
          </View>
        )}

        {expoPushToken.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{expoPushToken.error}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Immédiate</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre de la notification"
          value={notificationTitle}
          onChangeText={setNotificationTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Message de la notification"
          value={notificationBody}
          onChangeText={setNotificationBody}
        />
        <TouchableOpacity style={styles.button} onPress={handleSendImmediate}>
          <Text style={styles.buttonText}>Envoyer Immédiatement</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Programmée</Text>
        <TextInput
          style={styles.input}
          placeholder="Délai en secondes"
          value={delaySeconds}
          onChangeText={setDelaySeconds}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleScheduleNotification}>
          <Text style={styles.buttonText}>Programmer la Notification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelAll}>
          <Text style={styles.buttonText}>Annuler Toutes les Notifications</Text>
        </TouchableOpacity>
      </View>

      {notification && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernière Notification Reçue</Text>
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>
              Titre: {notification.request.content.title}
            </Text>
            <Text style={styles.notificationText}>
              Message: {notification.request.content.body}
            </Text>
            <Text style={styles.notificationText}>
              Date: {new Date(notification.date).toLocaleString()}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  tokenContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#666",
  },
  tokenText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
  },
  errorContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#c62828",
  },
  notificationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
});
