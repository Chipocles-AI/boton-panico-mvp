import * as Location from "expo-location";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAlert } from "../src/services/alerts";


export default function HomeScreen() {
  const onPressAlert = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude, accuracy } = location.coords;

    const alertId = await createAlert({
  userId: "device-demo",
  lat: latitude,
  lng: longitude,
  accuracy: accuracy ?? null,
});

Alert.alert(
  "🚨 Alerta enviada",
  `ID: ${alertId}\nLat: ${latitude}\nLng: ${longitude}`
);

  } catch (error) {
    Alert.alert("Error", "No se pudo obtener la ubicación.");
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Botón de Pánico</Text>
        <Text style={styles.subtitle}>MVP • Android primero</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.panicButton, pressed && styles.panicButtonPressed]}
        onPress={onPressAlert}
      >
        <Text style={styles.panicText}>ALERTA</Text>
      </Pressable>

      <Text style={styles.hint}>
        Presiona una vez para activar. (Luego agregamos ubicación, timestamp y usuario)
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#0b1220",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#cbd5e1",
  },
  panicButton: {
    height: 180,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e11d48",
  },
  panicButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  panicText: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 2,
  },
  hint: {
    marginTop: 18,
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 13,
  },
});


