import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


export async function createAlert(params: {
  userId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
}) {
  const docRef = await addDoc(collection(db, "alerts"), {
    userId: params.userId,
    status: "active",
    location: {
      lat: params.lat,
      lng: params.lng,
      accuracy: params.accuracy,
    },
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function closeAlert(alertId: string) {
  await updateDoc(doc(db, "alerts", alertId), {
    status: "closed",
    closedAt: serverTimestamp(),
  });
}