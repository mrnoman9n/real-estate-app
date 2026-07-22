import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../../../backend/Firebaseconfig";
import useSavedStore from "../../../store/savedStore";

const CATEGORIES = [
  { label: "All", icon: "grid-outline" },
  { label: "Apartment", icon: "business-outline" },
  { label: "Villa", icon: "home-outline" },
  { label: "Studio", icon: "cube-outline" },
  { label: "Bungalow", icon: "leaf-outline" },
];

const Index = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Zustand
  const { savedProperties, addSavedProperty, removeSavedProperty } =
    useSavedStore();

  const handleToggleSave = (propertyId) => {
    const isSaved = savedProperties.includes(propertyId);

    if (isSaved) {
      removeSavedProperty(propertyId);
    } else {
      addSavedProperty(propertyId);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "properties"));

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

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.firstName);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchProperties();
  }, []);

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

        <Text
          style={{
            marginTop: height * 0.015,
            fontSize: width * 0.038,
            color: "#94A3B8",
            fontWeight: "500",
          }}
        >
          Loading properties...
        </Text>
      </SafeAreaView>
    );
  }

  // Filter by category
  let filtered = properties;

  if (activeCategory !== "All") {
    filtered = filtered.filter(
      (item) => item.type?.toLowerCase() === activeCategory.toLowerCase(),
    );
  }

  // Filter by search
  if (search.trim() !== "") {
    filtered = filtered.filter((item) => {
      const q = search.toLowerCase();

      return (
        item.city?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q)
      );
    });
  }

  const featuredProperties = filtered.filter(
    (item) => item.isFeatured === true,
  );

  const recommendedProperties = filtered.filter(
    (item) => item.isFeatured !== true,
  );

  const renderProperty = ({ item }) => {
    const isSaved = savedProperties.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: "/mdtp", params: { id: item.id } })
        }
        style={{
          backgroundColor: "#fff",
          borderRadius: width * 0.05,
          overflow: "hidden",
          width: width * 0.44,
          marginRight: width * 0.035,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: height * 0.005 },
          shadowOpacity: 0.08,
          shadowRadius: width * 0.03,
          elevation: 3,
        }}
      >
        <View>
          <Image
            source={{ uri: item.images[0] }}
            style={{
              width: "100%",
              height: height * 0.16,
            }}
            resizeMode="cover"
          />

          {/* Heart Button */}
          <TouchableOpacity
            onPress={() => handleToggleSave(item.id)}
            style={{
              position: "absolute",
              top: height * 0.012,
              right: width * 0.025,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: width * 0.045,
              width: width * 0.09,
              height: width * 0.09,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={width * 0.045}
              color={isSaved ? "#EF4444" : "#2563EB"}
            />
          </TouchableOpacity>

          {/* Featured Badge */}
          {item.isFeatured && (
            <View
              style={{
                position: "absolute",
                top: height * 0.012,
                left: width * 0.025,
                backgroundColor: "#2563EB",
                paddingHorizontal: width * 0.02,
                paddingVertical: height * 0.005,
                borderRadius: width * 0.02,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: width * 0.025,
                  fontWeight: "700",
                }}
              >
                FEATURED
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: width * 0.03 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: width * 0.038,
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
              fontSize: width * 0.043,
              fontWeight: "800",
              color: "#2563EB",
              marginTop: height * 0.01,
            }}
          >
            ₹ {item.price.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.018,
            marginBottom: height * 0.022,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: width * 0.033,
                color: "#94A3B8",
                fontWeight: "500",
              }}
            >
              Hi {username || "there"} 👋
            </Text>

            <Text
              style={{
                fontSize: width * 0.058,
                fontWeight: "800",
                color: "#0F172A",
                marginTop: height * 0.003,
              }}
            >
              Find your dream home
            </Text>
          </View>

          <View
            style={{
              width: width * 0.12,
              height: width * 0.12,
              borderRadius: width * 0.06,
              backgroundColor: "#2563EB",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.05,
                fontWeight: "800",
                color: "#fff",
              }}
            >
              {username?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            marginHorizontal: width * 0.05,
            marginBottom: height * 0.02,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: width * 0.04,
            paddingHorizontal: width * 0.035,
            height: height * 0.065,
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: height * 0.004 },
            shadowOpacity: 0.06,
            shadowRadius: width * 0.03,
            elevation: 2,
          }}
        >
          <Ionicons name="search-outline" size={width * 0.05} color="#94A3B8" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search city, area, or project"
            placeholderTextColor="#94A3B8"
            style={{
              marginLeft: width * 0.025,
              fontSize: width * 0.035,
              color: "#0F172A",
              flex: 1,
            }}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={width * 0.05}
                color="#CBD5E1"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
            marginBottom: height * 0.03,
          }}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.label === activeCategory;

            return (
              <TouchableOpacity
                key={cat.label}
                onPress={() => setActiveCategory(cat.label)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: width * 0.038,
                  paddingVertical: height * 0.011,
                  borderRadius: width * 0.05,
                  marginRight: width * 0.022,
                  backgroundColor: active ? "#0F172A" : "#fff",
                  borderWidth: active ? 0 : 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Ionicons
                  name={cat.icon}
                  size={width * 0.04}
                  color={active ? "#fff" : "#64748B"}
                />
                <Text
                  style={{
                    fontSize: width * 0.033,
                    fontWeight: "600",
                    color: active ? "#fff" : "#64748B",
                    marginLeft: width * 0.015,
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: width * 0.05,
              marginBottom: height * 0.015,
            }}
          >
            <Text
              style={{
                fontSize: width * 0.048,
                fontWeight: "800",
                color: "#0F172A",
              }}
            >
              Featured Properties
            </Text>

            <Text
              style={{
                fontSize: width * 0.032,
                fontWeight: "700",
                color: "#2563EB",
              }}
            >
              {featuredProperties.length} listed
            </Text>
          </View>

          {featuredProperties.length === 0 ? (
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#94A3B8",
                paddingHorizontal: width * 0.05,
              }}
            >
              No featured properties right now.
            </Text>
          ) : (
            <FlatList
              data={featuredProperties}
              renderItem={renderProperty}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: width * 0.05,
              }}
            />
          )}
        </View>

        {/* Recommended */}
        <View style={{ marginTop: height * 0.035 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: width * 0.05,
              marginBottom: height * 0.015,
            }}
          >
            <Text
              style={{
                fontSize: width * 0.048,
                fontWeight: "800",
                color: "#0F172A",
              }}
            >
              Recommended Properties
            </Text>

            <Text
              style={{
                fontSize: width * 0.032,
                fontWeight: "700",
                color: "#2563EB",
              }}
            >
              {recommendedProperties.length} listed
            </Text>
          </View>

          {recommendedProperties.length === 0 ? (
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#94A3B8",
                paddingHorizontal: width * 0.05,
                paddingBottom: height * 0.035,
              }}
            >
              No properties match your filters.
            </Text>
          ) : (
            <FlatList
              data={recommendedProperties}
              renderItem={renderProperty}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: width * 0.05,
                paddingBottom: height * 0.035,
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
