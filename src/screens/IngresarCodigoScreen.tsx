import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { API_ROUTES } from "../api/routes";
import { useNavigation } from "@react-navigation/native";
import { palette } from "./MisAlbumesScreen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // Ajusta la ruta si es necesario

export default function IngresarCodigoScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBuscar = async () => {
    setLoading(true);
    const res = await fetch(API_ROUTES.FIND_ALBUM_BY_CODE(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setLoading(false);
    if (res.ok) {
      const album = await res.json();
      navigation.navigate("RetosAventura", { album });
    } else {
      Alert.alert("Código incorrecto", "No se encontró un álbum con ese código.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>#</Text>
      <Text style={styles.title}>Ingresar código de álbum</Text>
      <Text style={styles.subtitle}>
        ¿Alguien especial te compartió un código? Ingrésalo aquí para descubrir los recuerdos ocultos
      </Text>
      <Text style={styles.label}>Código del álbum (6 caracteres)</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        maxLength={6}
        autoCapitalize="characters"
        placeholder="K4HED4"
        placeholderTextColor={palette.muted}
      />
      <TouchableOpacity
        style={[styles.button, !code || code.length < 6 ? { opacity: 0.5 } : {}]}
        onPress={handleBuscar}
        disabled={!code || code.length < 6 || loading}
      >
        <Text style={styles.buttonText}>Comenzar aventura</Text>
      </TouchableOpacity>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💖 ¿Qué encontrarás?</Text>
        <Text style={styles.infoText}>
          Un álbum especial con retos que desbloquean fotos, videos y mensajes únicos. ¡Cada respuesta correcta revelará un recuerdo especial!
        </Text>
      </View>
      <View style={styles.infoBox2}>
        <Text style={styles.infoTitle2}>💡 ¿Cómo funciona?</Text>
        <Text style={styles.infoText2}>
          • Ingresa el código de 6 caracteres{"\n"}
          • Responde las preguntas y retos{"\n"}
          • Desbloquea recuerdos especiales{"\n"}
          • ¡Disfruta de los momentos únicos!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg1, alignItems: "center", padding: 24 },
  icon: { fontSize: 54, color: palette.pink, marginTop: 24, marginBottom: 8 },
  title: { fontSize: 24, color: palette.pink, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subtitle: { color: palette.text, fontSize: 15, marginBottom: 18, textAlign: "center" },
  label: { color: palette.text, fontWeight: "bold", marginBottom: 4, fontSize: 15 },
  input: {
    borderWidth: 2,
    borderColor: palette.pink,
    borderRadius: 10,
    padding: 12,
    fontSize: 22,
    color: palette.pink,
    textAlign: "center",
    letterSpacing: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
    width: 220,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: palette.pink,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 18,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" },
  infoBox: {
    backgroundColor: "#fff0fa",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    width: "100%",
    marginBottom: 8,
  },
  infoTitle: { color: palette.pink, fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  infoText: { color: palette.text, fontSize: 14 },
  infoBox2: {
    backgroundColor: "#f3f6ff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    width: "100%",
  },
  infoTitle2: { color: palette.text, fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  infoText2: { color: palette.text, fontSize: 14 },
});