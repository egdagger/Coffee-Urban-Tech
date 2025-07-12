import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "./context/UserContext";
import { router } from "expo-router";

// @ts-ignore
const CustomAlert = ({ visible, title, message, onClose }) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.alertButton}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();

  const { login } = useUser();

  const showCustomAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);

      showCustomAlert(
        "Bienvenido",
        `Hola ${user.name}, has iniciado sesión como ${user.role}`
      );

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } catch (error) {
      // @ts-ignore
      showCustomAlert("Error de Login", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logoSize = width < 360 ? 100 : 150;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/coffee.png")}
              style={{
                width: logoSize,
                height: logoSize,
                resizeMode: "contain",
              }}
            />
            <Text style={styles.title}>CoffeeUrbanTech</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  placeholderTextColor="#888"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#78350f", "#b45309"]}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setShowAlert(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#78350f",
    textAlign: "center",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: "transparent",
    color: "#222", // fuerza el color del texto siempre
  },
  eyeButton: {
    padding: 12,
    paddingLeft: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#78350f",
    paddingVertical: 12,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
