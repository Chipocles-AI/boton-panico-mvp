import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { closeAlert } from "../../src/services/alerts";
import { db } from "../../src/services/firebase";


type AlertDoc = {
  id: string;
  userId: string;
  status: "active" | "cancelled" | "closed";
  createdAt?: any;
  location?: { lat: number; lng: number; accuracy?: number };
};

export default function AdminScreen() {
  const [items, setItems] = useState<AlertDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);

  const q = useMemo(() => {
    return query(
      collection(db, "alerts"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: AlertDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        console.log("Firestore onSnapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [q]);

  const openMaps = (a: AlertDoc) => {
    const lat = a.location?.lat;
    const lng = a.location?.lng;
    if (lat == null || lng == null) return;

    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url);
  };
   

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Admin</Text>
      <Text style={styles.subtitle}>Alertas activas (tiempo real)</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No hay alertas activas.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={async () => {
  try {
    setClosingId(item.id);

    // 1) deja respirar a la UI para que se vea "Cerrando..."
    await new Promise((res) => setTimeout(res, 250));

    // 2) cierra en Firestore
    await closeAlert(item.id);

    // 3) dispara el popup fuera del ciclo de render (más confiable)
    setTimeout(() => {
      Alert.alert("✅ Alarma desactivada", "La alerta fue cerrada correctamente.");
    }, 50);
  } catch (e) {
    setTimeout(() => {
      Alert.alert("Error", "No se pudo cerrar la alerta. Intenta de nuevo.");
    }, 50);
  } finally {
    setClosingId(null);
  }
}}
>
              <Text style={styles.cardTitle}>🚨 {item.id}</Text>
              <Text style={styles.cardText}>Usuario: {item.userId}</Text>
              <Text style={styles.cardText}>
                Ubicación: {item.location?.lat?.toFixed(6)}, {item.location?.lng?.toFixed(6)}
              </Text>
              <Text style={styles.tapHint}>Toca para abrir en Maps</Text>

            <Pressable style={[styles.closeBtn, closingId === item.id && styles.closeBtnDisabled]}
                        disabled={closingId === item.id}
                            onPress={async () => {
                            try {
                                console.log("CERRANDO", item.id);
                                setClosingId(item.id);
                                await closeAlert(item.id);
                                Alert.alert("✅ Alarma desactivada", "La alerta fue cerrada correctamente.");
                                } catch (e) {
                                Alert.alert("Error", "No se pudo cerrar la alerta. Intenta de nuevo.");
                                } finally {
                                setClosingId(null);
                                }
                                    }}>
                <Text style={styles.closeBtnText}>
                     {closingId === item.id ? "Cerrando..." : "Cerrar alerta"}
                </Text>
            </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b1220" },
  title: { color: "white", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", marginTop: 6, marginBottom: 12 },
  center: { marginTop: 30, alignItems: "center", gap: 10 },
  muted: { color: "#cbd5e1" },
  sep: { height: 10 },
  card: { backgroundColor: "#111b2e", padding: 14, borderRadius: 14 },
  cardTitle: { color: "white", fontWeight: "800" },
  cardText: { color: "#cbd5e1", marginTop: 6 },
  tapHint: { color: "#93c5fd", marginTop: 10, fontSize: 12 },

  closeBtn: { marginTop: 12, alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#1f2937", },
  closeBtnText: { color: "#fbbf24", fontWeight: "800", },

  closeBtnDisabled: { opacity: 0.6, },
});
