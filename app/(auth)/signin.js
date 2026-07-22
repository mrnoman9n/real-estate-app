import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../backend/Firebaseconfig";

const { width, height } = Dimensions.get("window");

export default function Signin() {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState(null);

  const handleSignIn = async (values) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        Alert.alert(
          "Email not verified",
          "Please verify your email before continuing.",
        );
        return;
      }

      router.replace("/(root)/(tabs)");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const getInputStyle = (fieldName, extra = {}) => ({
    borderWidth: focusedField === fieldName ? width * 0.004 : width * 0.0025,
    borderColor: focusedField === fieldName ? "#3B5AF6" : "#e0e0e0",
    padding: width * 0.035,
    borderRadius: width * 0.025,
    fontSize: width * 0.038,
    marginBottom: height * 0.015,
    color: "#111",
    ...extra,
  });

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      onSubmit={handleSignIn}
    >
      {({ handleChange, handleSubmit, values }) => (
        <SafeAreaView
          style={{
            flex: 1,
            paddingHorizontal: width * 0.05,
            backgroundColor: "#fff",
          }}
        >
          <Image
            source={require("../../assets/images/kribb.png")}
            style={{
              height: height * 0.06,
              width: width * 0.3,
              marginTop: height * 0.05,
              marginBottom: height * 0.03,
              resizeMode: "contain",
            }}
          />

          <Text
            style={{
              fontSize: width * 0.07,
              fontWeight: "bold",
              color: "#111",
              marginBottom: height * 0.005,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              fontSize: width * 0.035,
              color: "#888",
              marginBottom: height * 0.03,
            }}
          >
            Sign in to find your dream home
          </Text>

          <TextInput
            placeholder="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={getInputStyle("email")}
          />

          <TextInput
            placeholder="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            secureTextEntry
            style={getInputStyle("password")}
          />

          <TouchableOpacity
            style={{
              backgroundColor: "#3B5AF6",
              borderRadius: width * 0.025,
              paddingVertical: height * 0.02,
              alignItems: "center",
              marginTop: height * 0.01,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: width * 0.04,
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: height * 0.02,
            }}
          >
            <Text style={{ color: "#888", fontSize: width * 0.035 }}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text
                style={{
                  color: "#3B5AF6",
                  fontWeight: "600",
                  fontSize: width * 0.035,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </Formik>
  );
}
