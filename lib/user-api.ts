import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "./firestore";

export const getUserById = async (id: string): Promise<User | null> => {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
};
