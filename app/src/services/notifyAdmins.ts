import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function notifyAdmins(payload: {
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  const snap = await getDocs(collection(db, "admin_devices"));
  const tokens = snap.docs.map((d) => (d.data() as any).token).filter(Boolean);

  if (!tokens.length) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      tokens.map((to) => ({
        to,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
      }))
    ),
  });
}
