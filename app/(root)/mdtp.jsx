import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
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
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../backend/Firebaseconfig";

const Mdtp = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchProperty = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "properties", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProperty({ id: docSnap.id, ...docSnap.data() });
        setSelectedImage(0);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

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

  if (!property) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Text style={{ fontSize: width * 0.038, color: "#94A3B8" }}>
          Property not found.
        </Text>
      </SafeAreaView>
    );
  }

  const statItems = [
    { icon: "home-outline", label: property.type },
    { icon: "bed-outline", label: `${property.bedrooms} Beds` },
    { icon: "water-outline", label: `${property.bathrooms} Baths` },
    { icon: "resize-outline", label: `${property.areaSqft} sqft` },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Image + back button */}
        <View>
          <Image
            source={{ uri: property.images[selectedImage] }}
            style={{
              width: "100%",
              height: height * 0.36,
            }}
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: height * 0.02,
              left: width * 0.05,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: width * 0.05,
              width: width * 0.1,
              height: width * 0.1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={width * 0.05} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "absolute",
              top: height * 0.02,
              right: width * 0.05,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: width * 0.05,
              width: width * 0.1,
              height: width * 0.1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="heart-outline"
              size={width * 0.05}
              color="#2563EB"
            />
          </TouchableOpacity>

          {/* Image counter badge */}
          {property.images.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: height * 0.02,
                right: width * 0.05,
                backgroundColor: "rgba(15,23,42,0.7)",
                paddingHorizontal: width * 0.03,
                paddingVertical: height * 0.006,
                borderRadius: width * 0.03,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="images-outline"
                size={width * 0.035}
                color="#fff"
              />
              <Text
                style={{
                  color: "#fff",
                  fontSize: width * 0.03,
                  fontWeight: "600",
                  marginLeft: width * 0.012,
                }}
              >
                {selectedImage + 1}/{property.images.length}
              </Text>
            </View>
          )}
        </View>

        {/* Thumbnails if multiple images */}
        {property.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: width * 0.05,
              marginTop: height * 0.015,
            }}
          >
            {property.images.map((img, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setSelectedImage(index)}
              >
                <Image
                  source={{ uri: img }}
                  style={{
                    width: width * 0.18,
                    height: width * 0.18,
                    borderRadius: width * 0.03,
                    marginRight: width * 0.025,
                    borderWidth: selectedImage === index ? 2.5 : 0,
                    borderColor: "#2563EB",
                    opacity: selectedImage === index ? 1 : 0.55,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Details */}
        <View
          style={{ paddingHorizontal: width * 0.05, marginTop: height * 0.025 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, marginRight: width * 0.03 }}>
              <Text
                style={{
                  fontSize: width * 0.052,
                  fontWeight: "800",
                  color: "#0F172A",
                }}
              >
                {property.title}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: height * 0.008,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={width * 0.04}
                  color="#94A3B8"
                />
                <Text
                  style={{
                    fontSize: width * 0.035,
                    color: "#94A3B8",
                    marginLeft: width * 0.012,
                  }}
                >
                  {property.city}
                </Text>
              </View>
            </View>

            {property.isFeatured && (
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  paddingHorizontal: width * 0.025,
                  paddingVertical: height * 0.006,
                  borderRadius: width * 0.02,
                }}
              >
                <Text
                  style={{
                    color: "#2563EB",
                    fontSize: width * 0.028,
                    fontWeight: "700",
                  }}
                >
                  FEATURED
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              fontSize: width * 0.062,
              fontWeight: "800",
              color: "#2563EB",
              marginTop: height * 0.018,
            }}
          >
            ₹ {property.price.toLocaleString()}
          </Text>

          {/* Type / Beds / Baths / Area row */}
          <View
            style={{
              flexDirection: "row",
              marginTop: height * 0.025,
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
            {statItems.map((stat, index) => (
              <View key={index} style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: width * 0.1,
                    height: width * 0.1,
                    borderRadius: width * 0.05,
                    backgroundColor: "#EFF6FF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={stat.icon}
                    size={width * 0.048}
                    color="#2563EB"
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: width * 0.03,
                    color: "#64748B",
                    marginTop: height * 0.007,
                    fontWeight: "600",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: width * 0.04,
              padding: width * 0.04,
              marginTop: height * 0.025,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: height * 0.003 },
              shadowOpacity: 0.05,
              shadowRadius: width * 0.02,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: width * 0.042,
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              Description
            </Text>

            <Text
              style={{
                fontSize: width * 0.035,
                color: "#64748B",
                marginTop: height * 0.01,
                lineHeight: width * 0.055,
              }}
            >
              {property.description}
            </Text>
          </View>

          {/* Location */}
          {property.latitude && property.longitude && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: width * 0.04,
                padding: width * 0.04,
                marginTop: height * 0.02,
                marginBottom: height * 0.02,
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: height * 0.003 },
                shadowOpacity: 0.05,
                shadowRadius: width * 0.02,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: width * 0.042,
                  fontWeight: "700",
                  color: "#0F172A",
                  marginBottom: height * 0.012,
                }}
              >
                Location
              </Text>

              <View
                style={{
                  borderRadius: width * 0.03,
                  overflow: "hidden",
                  height: height * 0.2,
                }}
              >
                <MapView
                  style={{ width: "100%", height: "100%" }}
                  initialRegion={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: property.latitude,
                      longitude: property.longitude,
                    }}
                  />
                </MapView>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom contact bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: width * 0.05,
          paddingVertical: height * 0.015,
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          style={{
            width: width * 0.13,
            height: width * 0.13,
            borderRadius: width * 0.035,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: width * 0.03,
          }}
        >
          <Ionicons name="call-outline" size={width * 0.05} color="#2563EB" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: width * 0.13,
            height: width * 0.13,
            borderRadius: width * 0.035,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: width * 0.03,
          }}
        >
          <Ionicons name="heart-outline" size={width * 0.05} color="#2563EB" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#0F172A",
            borderRadius: width * 0.035,
            paddingVertical: height * 0.018,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={width * 0.042}
            color="#fff"
          />
          <Text
            style={{
              color: "#fff",
              fontSize: width * 0.04,
              fontWeight: "700",
              marginLeft: width * 0.02,
            }}
          >
            Contact Agent
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Mdtp;
