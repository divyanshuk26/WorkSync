import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (errorMessage) setErrorMessage("");
  };

  const validateForm = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setErrorMessage(
        error?.message || "Invalid email or password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>WorkSync</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage("");
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!isSubmitting}
            />
          </View>

          <PrimaryButton
            title="Sign In"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          />

          {/* Demo Credentials Container */}
          <View style={styles.demoCredentialsContainer}>
            <Text style={styles.demoTitle}>🔑 Quick Demo Credentials</Text>
            <Text style={styles.demoSubtitle}>Tap a card below to auto-fill details:</Text>

            <View style={styles.demoCardsWrapper}>
              <TouchableOpacity
                style={styles.demoCard}
                onPress={() => fillCredentials("employer@worksync.com", "Employer@123")}
                activeOpacity={0.7}
              >
                <View style={styles.demoBadgeEmployer}>
                  <Text style={styles.demoRoleEmployer}>Employer Role</Text>
                </View>
                <Text style={styles.demoEmail}>employer@worksync.com</Text>
                <Text style={styles.demoPass}>Password: Employer@123</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoCard}
                onPress={() => fillCredentials("employee@worksync.com", "Employee@123")}
                activeOpacity={0.7}
              >
                <View style={styles.demoBadgeEmployee}>
                  <Text style={styles.demoRoleEmployee}>Employee Role</Text>
                </View>
                <Text style={styles.demoEmail}>employee@worksync.com</Text>
                <Text style={styles.demoPass}>Password: Employee@123</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0066cc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  formContainer: {
    width: "100%",
  },
  errorBanner: {
    backgroundColor: "#fde8e8",
    borderColor: "#f8b4b4",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#9b1c1c",
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  button: {
    marginTop: 8,
  },
  demoCredentialsContainer: {
    marginTop: 28,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  demoCardsWrapper: {
    gap: 10,
  },
  demoCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  demoBadgeEmployer: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  demoRoleEmployer: {
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "700",
  },
  demoBadgeEmployee: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  demoRoleEmployee: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "700",
  },
  demoEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  demoPass: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
