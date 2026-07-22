import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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
import { auth, db } from "../../backend/Firebaseconfig";

const { width, height } = Dimensions.get("window");

export default function Signup() {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState(null);

  const handleSignUp = async (values) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        photoURL: "",
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);

      Alert.alert(
        "Verification Sent",
        "Please check your email and verify your account.",
      );

      router.replace("/(auth)/signin");
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
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      }}
      onSubmit={handleSignUp}
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
            Create account
          </Text>

          <Text
            style={{
              fontSize: width * 0.035,
              color: "#888",
              marginBottom: height * 0.03,
            }}
          >
            Find your dream home today
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: width * 0.025,
              marginBottom: height * 0.005,
            }}
          >
            <TextInput
              placeholder="First Name"
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("firstName", { flex: 1 })}
            />

            <TextInput
              placeholder="Last Name"
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("lastName", { flex: 1 })}
            />
          </View>

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
              Sign Up
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
              Already have an account?{" "}
            </Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
              <Text
                style={{
                  color: "#3B5AF6",
                  fontWeight: "600",
                  fontSize: width * 0.035,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </Formik>
  );
}
