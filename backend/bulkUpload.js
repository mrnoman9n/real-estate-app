import { doc, setDoc } from "firebase/firestore";
import properties from "../data/property";
import { db } from "./Firebaseconfig";

const uploadProperties = async () => {
  try {
    for (const property of properties) {
      await setDoc(doc(db, "properties", property.id), {
        ...property,
        createdAt: new Date(),
      });

      console.log(`Uploaded : ${property.title} (id: ${property.id})`);
    }
    console.log("all properties uploaded successfully");
  } catch (error) {
    console.log("uploaded failed:", error);
  }
};

export default uploadProperties;
