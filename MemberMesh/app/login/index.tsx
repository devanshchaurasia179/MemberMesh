import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Dimensions,
  ScrollView
} from "react-native";
// Import from safe-area-context instead of react-native to fix the warning
import { useRouter } from "expo-router";
import { sendOtpApi } from "../../constants/auth.api";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const isButtonDisabled = mobile.length < 10 || loading;

  const handleSendOtp = async () => {
    if (mobile.length < 10) return;
    setLoading(true);
    try {
      await sendOtpApi(mobile);
      router.push({
        pathname: "/verify-otp",
        params: { mobile },
      });
    } catch (err) {
      console.log("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Illustration Section */}
            <View style={styles.topSection}>
              <Image 
                source={require("../../assets/images/auth.png")} 
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* Form Section with Rounded Top */}
            <View style={styles.formSection}>
              <View style={styles.header}>
                <Text style={styles.brandText}>
                  Welcome to <Text style={{color: '#B43788'}}>MemberMesh</Text>
                </Text>
                <Text style={styles.subBrandText}>Manage Membership Faster and Smarter</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={[
                  styles.phoneInputWrapper, 
                  isFocused && styles.inputFocused 
                ]}>
                  <Text style={styles.countryCode}>+91</Text>
                  {/* Fixed: Replaced <div> with <View> */}
                  <View style={styles.divider} />
                  <TextInput
                    placeholder="00000 00000"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={setMobile}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.button, isButtonDisabled && styles.buttonDisabled]} 
                onPress={handleSendOtp}
                disabled={isButtonDisabled}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Please wait..." : "Get OTP"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By continuing, you agree to our <Text style={styles.linkText}>Terms & Conditions</Text>
              </Text>

              {/* Secure Footer moved inside ScrollView for better UX during keyboard interaction */}
              <View style={styles.footerInner}>
                 <Text style={styles.footerText}>SECURE • QUICK • DIGITAL</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  illustration: {
    width: width * 0.75,
    height: "100%",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#FBFAFC",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 35,
    minHeight: height * 0.65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  header: {
    marginBottom: 35,
  },
  brandText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  subBrandText: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B43788",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#B43788",
  },
  countryCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  divider: {
    width: 1.5,
    height: "40%",
    backgroundColor: "#e2e8f0",
    marginHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#1e293b",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#B43788",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B43788",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  termsText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 25,
    lineHeight: 20,
  },
  linkText: {
    color: "#B43788",
    fontWeight: "700",
  },
  footerInner: {
    marginTop: 'auto',
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  }
});