import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  accent3: "#ffb300",
  text: "#a100a1",
  muted: "#bfa8cc",
  card: "#fff",
  border: "#e5d0f7",
  error: "#ffb0b0",
};

const albumSchema = z.object({
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string().optional(),
  category: z.string().min(1, "Selecciona una categoría"),
});

type AlbumForm = z.infer<typeof albumSchema>;

const categories = [
  { label: "Otro", value: "otro", icon: <MaterialCommunityIcons name="earth" size={20} color="#a100a1" /> },
  { label: "Viaje", value: "viaje", icon: <Ionicons name="airplane" size={20} color="#a100a1" /> },
  { label: "Amor", value: "amor", icon: <Ionicons name="heart" size={20} color="#a100a1" /> },
  { label: "Familia", value: "familia", icon: <Ionicons name="people" size={20} color="#a100a1" /> },
  // Agrega más si quieres
];

export default function CreateAlbumScreen({ navigation }: any) {
  const { token } = useUser();
  const [showCategories, setShowCategories] = useState(false);

  const form = useForm<AlbumForm>({
    resolver: zodResolver(albumSchema),
    defaultValues: { title: "", description: "", category: "otro" },
  });

  const onSubmit = async (data: AlbumForm) => {
    try {
      const response = await fetch(API_ROUTES.CREATE_ALBUM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const album = await response.json();
        navigation.replace("AlbumDetail", { album: album.album }); // Usa el objeto retornado por el backend
      } else {
        const result = await response.json();
        Alert.alert("Error", result.message || "No se pudo crear el álbum");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor");
    }
  };

  return (
    <LinearGradient colors={[palette.bg1, palette.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={palette.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Recuerdos Ocultos</Text>
              {/* Espacio para alinear */}
              <View style={{ width: 22 }} />
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Crear nuevo álbum</Text>
              <Text style={styles.subtitle}>
                Crea un álbum especial para guardar tus recuerdos ocultos
              </Text>

              {/* Título */}
              <Text style={styles.label}>Título del álbum</Text>
              <Controller
                control={form.control}
                name="title"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Viaje a Cancún, Nuestro Aniversario..."
                      placeholderTextColor={palette.muted}
                      value={value}
                      onChangeText={onChange}
                    />
                    {error && <Text style={styles.error}>{error.message}</Text>}
                  </>
                )}
              />

              {/* Descripción */}
              <Text style={styles.label}>Descripción (opcional)</Text>
              <Controller
                control={form.control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                    placeholder="Describe este álbum especial..."
                    placeholderTextColor={palette.muted}
                    value={value}
                    onChangeText={onChange}
                    multiline
                  />
                )}
              />

              {/* Categoría */}
              <Text style={styles.label}>Categoría</Text>
              <Controller
                control={form.control}
                name="category"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TouchableOpacity
                      style={styles.select}
                      onPress={() => setShowCategories(!showCategories)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.selectRow}>
                        {categories.find((c) => c.value === value)?.icon}
                        <Text style={styles.selectText}>
                          {categories.find((c) => c.value === value)?.label}
                        </Text>
                      </View>
                      <Ionicons
                        name={showCategories ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={palette.text}
                      />
                    </TouchableOpacity>
                    {showCategories && (
                      <View style={styles.dropdown}>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.value}
                            style={styles.dropdownItem}
                            onPress={() => {
                              onChange(cat.value);
                              setShowCategories(false);
                            }}
                          >
                            {cat.icon}
                            <Text style={styles.selectText}>{cat.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {error && <Text style={styles.error}>{error.message}</Text>}
                  </>
                )}
              />

              {/* Botón */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={form.handleSubmit(onSubmit)}
              >
                <LinearGradient
                  colors={["#d726a1", "#7e30e1"]}
                  style={styles.gradientBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryBtnText}>Guardar álbum</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Info */}
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>💡 ¿Qué sigue?</Text>
                <Text style={styles.infoText}>
                  Una vez creado el álbum, podrás añadir retos y recuerdos ocultos. También obtendrás un código único para compartir con esa persona especial.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.accent2,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 28,
    width: 350,
    maxWidth: "95%",
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.accent2,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#b06fc9",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  label: {
    color: "#a100a1",
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10,
  },
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
  },
  select: {
    backgroundColor: "#faf6ff",
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectText: {
    color: "#a100a1",
    fontSize: 15,
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: "#faf6ff",
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 10,
  },
  gradientBtn: {
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: palette.error,
    marginTop: 2,
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: "#fff0f5",
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ffd1e8",
  },
  infoTitle: {
    fontWeight: "700",
    color: "#d726a1",
    marginBottom: 2,
  },
  infoText: {
    color: "#d726a1",
    fontSize: 13,
  },
});