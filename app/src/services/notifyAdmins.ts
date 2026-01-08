import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

type NotifyPayload = {
  title: string;
  body: string;
  data?: Record<string, any>;
};

export async function notifyAdmins(payload: NotifyPayload) {
  // 1) Leer tokens de admins
  const snap = await getDocs(collection(db, "admin_devices"));
  const tokens = snap.docs
    .map((d) => (d.data() as any).token as string)
    .filter(Boolean);

  if (!tokens.length) return { ok: false, reason: "No admin tokens" };

  // 2) Enviar push por Expo Push Service
  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }));

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const json = await res.json();
  return { ok: true, json };
}

