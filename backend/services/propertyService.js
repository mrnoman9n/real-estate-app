import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../Firebaseconfig";

export const saveProperty = async (propertyId) => {
  try {
    await addDoc(collection(db, "saved_properties"), {
      userId: auth.currentUser.uid,
      propertyId,
      createdAt: serverTimestamp(),
    });

    console.log("Property saved");
  } catch (error) {
    console.log(error.message);
  }
};
