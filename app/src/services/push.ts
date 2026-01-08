import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerAdminDeviceForPush() {
  if (!Device.isDevice) throw new Error("Push requiere un dispositivo físico (no emulador).");

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") throw new Error("Permiso de notificaciones denegado.");

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
  });

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ??
    (Constants.easConfig as any)?.projectId;

  if (!projectId) throw new Error("No projectId found (EAS). Revisa app.json -> extra.eas.projectId");

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // ✅ Guardar en Firestore
  await addDoc(collection(db, "admin_devices"), {
    token,
    platform: "android",
    deviceName: Device.deviceName ?? null,
    createdAt: serverTimestamp(),
  });

  return token;
}
