import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../../backend/Firebaseconfig";
import useSavedStore from "../../../store/savedStore";

const Saved = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();

  const { savedProperties, removeSavedProperty } = useSavedStore();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);

      if (savedProperties.length === 0) {
        setProperties([]);
        return;
      }

      const q = query(
        collection(db, "properties"),
        where(documentId(), "in", savedProperties.slice(0, 10)),
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProperties(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProperties();
  }, [savedProperties]);

  const renderProperty = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({ pathname: "/mdtp", params: { id: item.id } })
      }
      style={{
        backgroundColor: "#fff",
        borderRadius: width * 0.05,
        overflow: "hidden",
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.02,
        flexDirection: "row",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: height * 0.005 },
        shadowOpacity: 0.08,
        shadowRadius: width * 0.03,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={{
          width: width * 0.3,
          height: width * 0.3,
        }}
        resizeMode="cover"
      />

      <View
        style={{ flex: 1, padding: width * 0.03, justifyContent: "center" }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: width * 0.04,
            fontWeight: "700",
            color: "#0F172A",
          }}
        >
          {item.title}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: height * 0.005,
          }}
        >
          <Ionicons
            name="location-outline"
            size={width * 0.033}
            color="#94A3B8"
          />

          <Text
            numberOfLines={1}
            style={{
              fontSize: width * 0.03,
              color: "#94A3B8",
              marginLeft: width * 0.01,
            }}
          >
            {item.city}
          </Text>
        </View>

        <Text
          style={{
            fontSize: width * 0.04,
            fontWeight: "800",
            color: "#2563EB",
            marginTop: height * 0.008,
          }}
        >
          ₹ {item.price.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => removeSavedProperty(item.id)}
        style={{
          padding: width * 0.03,
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={width * 0.05} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
      <Text
        style={{
          fontSize: width * 0.055,
          fontWeight: "800",
          color: "#0F172A",
          paddingHorizontal: width * 0.05,
          marginTop: height * 0.015,
          marginBottom: height * 0.02,
        }}
      >
        Saved Properties
      </Text>

      {properties.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: width * 0.1,
          }}
        >
          <Ionicons name="heart-outline" size={width * 0.15} color="#CBD5E1" />
          <Text
            style={{
              fontSize: width * 0.04,
              color: "#94A3B8",
              textAlign: "center",
              marginTop: height * 0.02,
            }}
          >
            No saved properties yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: height * 0.03 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Saved;
