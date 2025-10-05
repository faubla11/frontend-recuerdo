import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ROUTES } from "../api/routes";
import { useUser } from "../contexts/UserContext";

const palette = {
  bg1: "#fff6fb",
  bg2: "#fbefff",
  accent: "#d726a1",
  accent2: "#7e30e1",
  text: "#a100a1",
  muted: "#bfa8cc",
  card: "#fff",
  border: "#e5d0f7",
};

// Schemas
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Tu nombre"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string().min(6),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

type FormData = {
  name?: string;
  email: string;
  password: string;
  confirm?: string;
};

export default function AuthScreen() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const { login } = useUser();
  const { width } = useWindowDimensions();

  const form = useForm<FormData>({
    resolver: zodResolver(tab === "login" ? loginSchema : registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmitLogin = async (data: FormData) => {
    const response = await fetch(API_ROUTES.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      await login(result.user, result.token);
    } else {
      const errorData = await response.json();
      Alert.alert("Error", errorData.message);
    }
  };

  const onSubmitRegister = async (data: FormData) => {
    const response = await fetch(API_ROUTES.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      Alert.alert("Registro", `Bienvenido, ${responseData.user.name}`);
    } else {
      const errorData = await response.json();
      Alert.alert("Error", errorData.message);
    }
  };

  const onSubmit = (data: FormData) => {
    if (tab === "login") {
      onSubmitLogin(data);
    } else {
      onSubmitRegister(data);
    }
  };

  // Responsivo: ajusta el ancho de la tarjeta según el tamaño de pantalla
  const cardWidth = width > 500 ? 400 : "95%";

  return (
    <LinearGradient colors={[palette.bg1, palette.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 20,
              minHeight: "100%",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, { width: cardWidth }]}>
              {/* Tabs */}
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  style={[styles.tab, tab === "login" && styles.tabActive]}
                  onPress={() => setTab("login")}
                >
                  <Text style={[styles.tabText, tab === "login" && styles.tabTextActive]}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, tab === "register" && styles.tabActive]}
                  onPress={() => setTab("register")}
                >
                  <Text style={[styles.tabText, tab === "register" && styles.tabTextActive]}>
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Iconos */}
              <View style={styles.iconRow}>
                <Text style={styles.icon}>💖</Text>
                <Text style={styles.icon}>🎁</Text>
              </View>
              <Text style={styles.title}>Recuerdos Ocultos</Text>
              <Text style={styles.subtitle}>
                {tab === "register"
                  ? "Crea tu cuenta y comienza a guardar recuerdos únicos"
                  : "Inicia sesión para continuar"}
              </Text>

              {/* Campos */}
              {tab === "register" && (
                <Field control={form.control} name="name" placeholder="Tu nombre completo" label="Nombre" />
              )}
              <Field
                control={form.control}
                name="email"
                placeholder="tu@email.com"
                label="Email"
                keyboardType="email-address"
              />
              <Field
                control={form.control}
                name="password"
                placeholder="********"
                label="Contraseña"
                secureTextEntry
              />
              {tab === "register" && (
                <Field
                  control={form.control}
                  name="confirm"
                  placeholder="********"
                  label="Confirmar contraseña"
                  secureTextEntry
                />
              )}

              {/* Botón */}
              <Button text={tab === "login" ? "Iniciar sesión" : "Registrarme"} onPress={form.handleSubmit(onSubmit)} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Campo reutilizable
function Field({ control, name, placeholder, label, secureTextEntry, keyboardType }: any) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={palette.muted}
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize="none"
            />
            {error && <Text style={styles.error}>{error.message}</Text>}
          </View>
        )}
      />
    </>
  );
}

// Botón reutilizable
function Button({ text, onPress }: any) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
      <LinearGradient
        colors={["#d726a1", "#7e30e1"]}
        style={styles.gradientBtn}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.primaryBtnText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    marginVertical: 32,
    marginHorizontal: "auto", // Centrado en web
  },
  tabsRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 18,
    backgroundColor: "#f3e6fa",
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#e7d0fa",
  },
  tabText: {
    color: palette.muted,
    fontWeight: "600",
    fontSize: 15,
  },
  tabTextActive: {
    color: palette.text,
    fontWeight: "700",
  },
  iconRow: { flexDirection: "row", justifyContent: "center", marginBottom: 8 },
  icon: { fontSize: 32, marginHorizontal: 4 },
  title: { fontSize: 24, fontWeight: "700", color: palette.text, textAlign: "center", marginBottom: 4, marginTop: 4 },
  subtitle: { color: "#b06fc9", fontSize: 15, textAlign: "center", marginBottom: 18 },
  label: { color: "#a100a1", fontWeight: "600", alignSelf: "flex-start", marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: "#faf6ff",
    borderColor: palette.border,
    borderWidth: 1,
    color: "#a100a1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    fontSize: 15,
    width: 250,
    maxWidth: "100%",
  },
  primaryBtn: { width: "100%", borderRadius: 8, overflow: "hidden", marginTop: 18, marginBottom: 10 },
  gradientBtn: { paddingVertical: 13, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchText: { color: "#7e30e1", textAlign: "center", marginTop: 8, fontSize: 14 },
  link: { color: "#d726a1", textDecorationLine: "underline", fontWeight: "700" },
  error: { color: "#d7266a", marginTop: 2, fontSize: 12, alignSelf: "flex-start" },
});
