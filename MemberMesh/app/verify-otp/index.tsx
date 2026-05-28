import React, { useState, useEffect } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  Dimensions, 
  ScrollView,
  ToastAndroid // Added for Android notifications
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { verifyOtpApi, sendOtpApi } from "../../constants/auth.api";
import { useAuth } from "../../providers/AuthProvider";

// Specialized OTP Field Components
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const { width, height } = Dimensions.get("window");
const CELL_COUNT = 6; // Number of OTP digits

export default function VerifyOtp() {
  const { mobile } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const { setUser } = useAuth();
  const router = useRouter();

  // Hooks for the OTP Box Field
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  // Helper function for Android Toasts
  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        0,
        50
      );
    }
  };

  // Handle Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < CELL_COUNT) return;
    setLoading(true);
    try {
      const res = await verifyOtpApi(mobile, otp);
      showToast("Verification Successful");
      setUser(res.data.business);
      router.replace("/dashboard");
    } catch (err) {
      console.log("Verification Error:", err);
      showToast("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await sendOtpApi(mobile);
      showToast("OTP Resent Successfully");
      setTimer(30); // Reset timer
      setOtp("");   // Clear old OTP
    } catch (err) {
      console.log("Resend Error:", err);
      showToast("Failed to resend OTP");
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            bounces={false}
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

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.header}>
                <Text style={styles.brandText}>Verify Code</Text>
                <Text style={styles.subBrandText}>
                  We have sent an OTP to <Text style={styles.phoneHighlight}>+91 {mobile}</Text>
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Enter 6-Digit OTP</Text>
                
                {/* Professional Box Input */}
                <CodeField
                  ref={ref}
                  {...props}
                  value={otp}
                  onChangeText={setOtp}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode" // Enables iOS Auto-fill
                  renderCell={({ index, symbol, isFocused }) => (
                    <View
                      onLayout={getCellOnLayoutHandler(index)}
                      key={index}
                      style={[
                        styles.cell, 
                        isFocused && styles.focusCell,
                        symbol ? styles.filledCell : null
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                      </Text>
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.button, (otp.length < CELL_COUNT || loading) && styles.buttonDisabled]} 
                onPress={handleVerify}
                disabled={otp.length < CELL_COUNT || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Verifying..." : "Verify & Proceed"}
                </Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                  <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerInner}>
                 <Text style={styles.footerText}>SECURE • QUICK • DIGITAL</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaProvider>
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
  },
  subBrandText: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 8,
    lineHeight: 22,
  },
  phoneHighlight: {
    color: "#B43788",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B43788",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  
  // OTP BOX STYLES
  codeFieldRoot: {
    width: '100%',
    justifyContent: 'space-between',
  },
  cell: {
    width: (width - 100) / 6, // Dynamically size boxes based on screen width
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    // Adding a subtle shadow to each box
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  focusCell: {
    borderColor: "#B43788",
    borderWidth: 2,
    backgroundColor: "#FFF9FC", // Very light tint when focused
  },
  filledCell: {
    borderColor: "#B43788",
  },
  cellText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
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
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  resendText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  resendLink: {
    color: "#B43788",
    fontWeight: "700",
    fontSize: 14,
  },
  resendDisabled: {
    color: "#cbd5e1",
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