import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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

import { db } from "../../../backend/Firebaseconfig";

const PROPERTY_TYPES = [
  { label: "All", icon: "grid-outline" },
  { label: "Apartment", icon: "business-outline" },
  { label: "Villa", icon: "home-outline" },
  { label: "House", icon: "home-outline" },
  { label: "Plot", icon: "map-outline" },
];

const PRICE_RANGES = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under ₹20L", min: 0, max: 2000000 },
  { label: "₹20L–50L", min: 2000000, max: 5000000 },
  { label: "₹50L–1Cr", min: 5000000, max: 10000000 },
  { label: "Above ₹1Cr", min: 10000000, max: Infinity },
];

const Search = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [cityFilter, setCityFilter] = useState("");
  const [showCityInput, setShowCityInput] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "properties"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllProperties(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((item) => {
      const matchesSearch =
        searchText.trim() === "" ||
        item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType =
        selectedType === "All" ||
        item.type?.toLowerCase().trim() === selectedType.toLowerCase().trim();

      const matchesPrice =
        item.price >= selectedPriceRange.min &&
        item.price <= selectedPriceRange.max;

      const matchesCity =
        cityFilter.trim() === "" ||
        item.city?.toLowerCase().includes(cityFilter.toLowerCase());

      return matchesSearch && matchesType && matchesPrice && matchesCity;
    });
  }, [allProperties, searchText, selectedType, selectedPriceRange, cityFilter]);

  const activeFilterCount =
    (selectedType !== "All" ? 1 : 0) +
    (selectedPriceRange.label !== "Any price" ? 1 : 0) +
    (cityFilter.trim() !== "" ? 1 : 0);

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
        source={{ uri: item.images?.[0] }}
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
          ₹ {item.price?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={{ backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: width * 0.05,
          paddingTop: height * 0.02,
          paddingBottom: height * 0.015,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.065,
            fontWeight: "800",
            color: "#0F172A",
          }}
        >
          Find a place
        </Text>
        <Text
          style={{
            fontSize: width * 0.033,
            color: "#94A3B8",
            marginTop: height * 0.004,
          }}
        >
          Search by title, city, type, or budget
        </Text>
      </View>

      {/* Filter card */}
      <View
        style={{
          marginHorizontal: width * 0.05,
          backgroundColor: "#fff",
          borderRadius: width * 0.055,
          padding: width * 0.04,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: height * 0.004 },
          shadowOpacity: 0.06,
          shadowRadius: width * 0.03,
          elevation: 2,
        }}
      >
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: width * 0.035,
            paddingHorizontal: width * 0.035,
            height: height * 0.058,
          }}
        >
          <Ionicons name="search-outline" size={width * 0.05} color="#94A3B8" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Title or city"
            placeholderTextColor="#94A3B8"
            style={{
              flex: 1,
              marginLeft: width * 0.025,
              fontSize: width * 0.037,
              color: "#0F172A",
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={width * 0.05}
                color="#CBD5E1"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowCityInput((prev) => !prev)}
            style={{
              marginLeft: width * 0.02,
              width: width * 0.09,
              height: width * 0.09,
              borderRadius: width * 0.045,
              backgroundColor: showCityInput ? "#2563EB" : "#E2E8F0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="options-outline"
              size={width * 0.045}
              color={showCityInput ? "#fff" : "#64748B"}
            />
          </TouchableOpacity>
        </View>

        {/* City filter (togglable) */}
        {showCityInput && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              borderRadius: width * 0.035,
              paddingHorizontal: width * 0.035,
              height: height * 0.052,
              marginTop: height * 0.012,
            }}
          >
            <Ionicons
              name="location-outline"
              size={width * 0.045}
              color="#94A3B8"
            />
            <TextInput
              value={cityFilter}
              onChangeText={setCityFilter}
              placeholder="Narrow down by exact city"
              placeholderTextColor="#94A3B8"
              style={{
                flex: 1,
                marginLeft: width * 0.02,
                fontSize: width * 0.035,
                color: "#0F172A",
              }}
            />
          </View>
        )}

        {/* Type filter */}
        <Text
          style={{
            fontSize: width * 0.03,
            fontWeight: "700",
            color: "#94A3B8",
            letterSpacing: 0.5,
            marginTop: height * 0.02,
            marginBottom: height * 0.01,
          }}
        >
          PROPERTY TYPE
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: width * 0.02 }}
        >
          {PROPERTY_TYPES.map((typeItem) => {
            const isActive = selectedType === typeItem.label;
            return (
              <TouchableOpacity
                key={typeItem.label}
                onPress={() => setSelectedType(typeItem.label)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: width * 0.035,
                  paddingVertical: height * 0.011,
                  borderRadius: width * 0.04,
                  backgroundColor: isActive ? "#0F172A" : "#F1F5F9",
                  marginRight: width * 0.022,
                }}
              >
                <Ionicons
                  name={typeItem.icon}
                  size={width * 0.04}
                  color={isActive ? "#fff" : "#64748B"}
                />
                <Text
                  style={{
                    fontSize: width * 0.033,
                    fontWeight: "600",
                    color: isActive ? "#fff" : "#475569",
                    marginLeft: width * 0.015,
                  }}
                >
                  {typeItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Price filter */}
        <Text
          style={{
            fontSize: width * 0.03,
            fontWeight: "700",
            color: "#94A3B8",
            letterSpacing: 0.5,
            marginTop: height * 0.02,
            marginBottom: height * 0.01,
          }}
        >
          PRICE RANGE
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: width * 0.02 }}
        >
          {PRICE_RANGES.map((range) => {
            const isActive = selectedPriceRange.label === range.label;
            return (
              <TouchableOpacity
                key={range.label}
                onPress={() => setSelectedPriceRange(range)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: width * 0.038,
                  paddingVertical: height * 0.011,
                  borderRadius: width * 0.04,
                  backgroundColor: isActive ? "#2563EB" : "#F1F5F9",
                  marginRight: width * 0.022,
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.033,
                    fontWeight: "600",
                    color: isActive ? "#fff" : "#475569",
                  }}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: width * 0.06,
          marginTop: height * 0.022,
          marginBottom: height * 0.01,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.035,
            color: "#64748B",
            fontWeight: "600",
          }}
        >
          {loading
            ? "Searching..."
            : `${filteredProperties.length} propert${
                filteredProperties.length === 1 ? "y" : "ies"
              } found`}
        </Text>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSelectedType("All");
              setSelectedPriceRange(PRICE_RANGES[0]);
              setCityFilter("");
            }}
          >
            <Text
              style={{
                fontSize: width * 0.033,
                color: "#2563EB",
                fontWeight: "700",
              }}
            >
              Clear filters
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <ListHeader />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          paddingBottom: height * 0.03,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: width * 0.1,
              marginTop: height * 0.06,
            }}
          >
            <Ionicons
              name="search-outline"
              size={width * 0.15}
              color="#CBD5E1"
            />
            <Text
              style={{
                fontSize: width * 0.04,
                color: "#94A3B8",
                textAlign: "center",
                marginTop: height * 0.02,
              }}
            >
              No properties match your search
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Search;
