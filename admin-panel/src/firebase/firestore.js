import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);

// -------- ADMIN CHECK --------
export const isAdminUser = async (uid) => {
  const ref = doc(db, "admins", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;
  return snap.data().status === "active";
};

// -------- LOCATION --------
export const addCity = (name) =>
  addDoc(collection(db, "cities"), {
    name,
    createdAt: Date.now()
  });

export const getCities = async () => {
  const snap = await getDocs(collection(db, "cities"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addArea = (name, cityId) =>
  addDoc(collection(db, "areas"), {
    name,
    cityId,
    createdAt: Date.now()
  });

export const getAreasByCity = async (cityId) => {
  const q = query(
    collection(db, "areas"),
    where("cityId", "==", cityId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
