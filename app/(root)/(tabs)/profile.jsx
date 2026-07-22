import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db, storage } from "../../../backend/Firebaseconfig";
import useSavedStore from "../../../store/savedStore";

const Profile = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();

  const { savedProperties } = useSavedStore();

  const [userData, setUserData] = useState(null);
  const [listingsCount, setListingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }

      const listingsQuery = query(
        collection(db, "properties"),
        where("userId", "==", user.uid),
      );

      const listingsSnap = await getDocs(listingsQuery);

      setListingsCount(listingsSnap.size);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Pick and upload image
  const pickAndUploadImage = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Permission is required to upload image");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      setUploading(true);

      const imageUri = result.assets[0].uri;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: downloadURL,
      });

      setUserData((prev) => ({
        ...prev,
        photoURL: downloadURL,
      }));
    } catch (error) {
      console.log(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/signin");
    } catch (error) {
      console.log(error.message);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text
          style={{
            fontSize: width * 0.055,
            fontWeight: "800",
            color: "#0F172A",
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.015,
            marginBottom: height * 0.025,
          }}
        >
          Profile
        </Text>

        {/* User Card */}
        <View
          style={{
            marginHorizontal: width * 0.05,
            backgroundColor: "#fff",
            borderRadius: width * 0.05,
            padding: width * 0.05,
            alignItems: "center",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: height * 0.004 },
            shadowOpacity: 0.06,
            shadowRadius: width * 0.03,
            elevation: 2,
          }}
        >
          {/* Profile Image */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickAndUploadImage}
            style={{ position: "relative" }}
          >
            {userData?.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={{
                  width: width * 0.22,
                  height: width * 0.22,
                  borderRadius: width * 0.11,
                }}
              />
            ) : (
              <View
                style={{
                  width: width * 0.22,
                  height: width * 0.22,
                  borderRadius: width * 0.11,
                  backgroundColor: "#2563EB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.08,
                    fontWeight: "800",
                    color: "#fff",
                  }}
                >
                  {userData?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}

            {/* Camera Button */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#2563EB",
                width: width * 0.075,
                height: width * 0.075,
                borderRadius: width * 0.0375,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: "#fff",
              }}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={width * 0.035} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: width * 0.05,
              fontWeight: "800",
              color: "#0F172A",
              marginTop: height * 0.015,
            }}
          >
            {userData?.firstName} {userData?.lastName}
          </Text>

          <Text
            style={{
              fontSize: width * 0.033,
              color: "#94A3B8",
              marginTop: height * 0.004,
            }}
          >
            {userData?.email}
          </Text>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: width * 0.05,
            marginTop: height * 0.02,
            backgroundColor: "#fff",
            borderRadius: width * 0.04,
            paddingVertical: height * 0.02,
            justifyContent: "space-around",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: height * 0.003 },
            shadowOpacity: 0.05,
            shadowRadius: width * 0.02,
            elevation: 2,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: width * 0.05,
                fontWeight: "800",
                color: "#2563EB",
              }}
            >
              {savedProperties.length}
            </Text>

            <Text
              style={{
                fontSize: width * 0.03,
                color: "#94A3B8",
                marginTop: height * 0.004,
              }}
            >
              Saved
            </Text>
          </View>

          <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: width * 0.05,
                fontWeight: "800",
                color: "#2563EB",
              }}
            >
              {listingsCount}
            </Text>

            <Text
              style={{
                fontSize: width * 0.03,
                color: "#94A3B8",
                marginTop: height * 0.004,
              }}
            >
              Listings
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginHorizontal: width * 0.05,
            marginTop: height * 0.03,
            marginBottom: height * 0.04,
            backgroundColor: "#FEF2F2",
            borderRadius: width * 0.04,
            paddingVertical: height * 0.018,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={width * 0.05}
            color="#DC2626"
          />

          <Text
            style={{
              fontSize: width * 0.038,
              fontWeight: "700",
              color: "#DC2626",
              marginLeft: width * 0.02,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
