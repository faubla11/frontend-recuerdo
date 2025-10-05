import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Dimensions } from "react-native";
import { API_ROUTES } from "../api/routes";
import { useNavigation, useRoute } from "@react-navigation/native";
import { palette } from "./MisAlbumesScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BACKEND_URL = "https://php-laravel-docker-j6so.onrender.com";

function ImageModal({ uri, visible, onClose }: { uri: string, visible: boolean, onClose: () => void }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}
      onClick={onClose}
    >
      <img src={uri} style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16 }} alt="Recuerdo" />
    </div>
  );
}

export default function RetosAventuraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { album } = route.params as any;
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecuerdo, setShowRecuerdo] = useState(false);
  const [recuerdo, setRecuerdo] = useState<any>(null);
  const [showImage, setShowImage] = useState(false);
  const [imageToShow, setImageToShow] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const retos = album.challenges;
  const reto = retos[current];

  const handleResponder = async () => {
    setLoading(true);
    const res = await fetch(API_ROUTES.VALIDATE_CHALLENGE(reto.id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    setLoading(false);
    const data = await res.json();
    if (data.correct) {
      setRecuerdo(data.memories);
      setShowRecuerdo(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      Alert.alert("Respuesta incorrecta", "Intenta de nuevo.");
    }
  };

  const handleSiguiente = () => {
    setShowRecuerdo(false);
    setAnswer("");
    if (current + 1 < retos.length) {
      setCurrent(current + 1);
    } else {
      navigation.navigate("AlbumCompleto", { album });
    }
  };

  const handleImagePress = (uri: string) => {
    setImageToShow(uri);
    setShowImage(true);
  };

  // Para el input de fecha en web
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  if (!reto)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: palette.pink, fontSize: 22, textAlign: "center" }}>¡No hay retos!</Text>
      </SafeAreaView>
    );

  if (showRecuerdo) {
    return (
      <SafeAreaView style={[styles.recuerdoBox, { position: "relative" }]}>
        {showConfetti && (
          <ConfettiCannon
            count={120}
            origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
            fadeOut={true}
            autoStart={true}
          />
        )}
        <Text style={styles.correcto}>¡Correcto!</Text>
        <Text style={styles.recuerdoTitle}>Recuerdo desbloqueado 🎉</Text>
        {recuerdo && recuerdo.length > 0 && (
          <View>
            {recuerdo.map((mem: any, idx: number) => (
              <View key={idx} style={styles.recuerdoCard}>
                {mem.type === "photo" && (
                  <>
                    <TouchableOpacity onPress={() => handleImagePress(`${BACKEND_URL}/storage/${mem.file_path}`)}>
                      <Image
                        source={{ uri: `${BACKEND_URL}/storage/${mem.file_path}` }}
                        style={{ width: 320, height: 220, borderRadius: 16, marginBottom: 8 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </>
                )}
                {mem.type === "note" && <Text style={styles.recuerdoNote}>{mem.note}</Text>}
                {mem.type === "video" && (
                  <Text style={styles.recuerdoImg}>[Video: {mem.file_path}]</Text>
                )}
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={handleSiguiente}>
          <Text style={styles.buttonText}>
            {current + 1 < retos.length ? "Siguiente reto" : "Ver álbum completo"}
          </Text>
        </TouchableOpacity>
        <ImageModal uri={imageToShow ?? ""} visible={showImage} onClose={() => setShowImage(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.albumTitle}>{album.title}</Text>
      <Text style={styles.retoNum}>Reto {current + 1} de {retos.length}</Text>
      <View style={styles.retoBox}>
        <Text style={styles.retoPregunta}>{reto.question}</Text>
        <Text style={styles.retoTipo}>
          {reto.answer_type === "text" && "Respuesta libre"}
          {reto.answer_type === "date" && "Fecha"}
          {reto.answer_type === "exact" && "Frase"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {reto.answer_type === "date" ? (
          <input
            type="text"
            value={answer}
            onChange={handleDateInput}
            placeholder="Ejemplo: 2025-09-01"
            style={{
              border: `2px solid ${palette.pink}`,
              borderRadius: 10,
              padding: 12,
              fontSize: 18,
              color: palette.pink,
              backgroundColor: "#fff",
              marginBottom: 16,
              marginTop: 8,
              maxWidth: 260,
              width: "100%",
            }}
            onFocus={e => (e.target.type = "date")}
            onBlur={e => (e.target.type = "text")}
          />
        ) : (
          <TextInput
            style={[styles.input, { flex: 1, maxWidth: 260, alignSelf: "center" }]}
            value={answer}
            onChangeText={setAnswer}
            placeholder={
              reto.answer_type === "date"
                ? "Ejemplo: 2025-09-01"
                : "Escribe tu respuesta aquí..."
            }
            placeholderTextColor={palette.muted}
            keyboardType={reto.answer_type === "date" ? "numbers-and-punctuation" : "default"}
            editable={true}
          />
        )}
        {reto.answer_type === "date" && (
          <MaterialCommunityIcons name="calendar" size={32} color={palette.pink} style={{ marginLeft: 8 }} />
        )}
      </View>
      <TouchableOpacity
        style={[styles.button, !answer ? { opacity: 0.5 } : {}, { maxWidth: 260, alignSelf: "center" }]}
        onPress={handleResponder}
        disabled={!answer || loading}
      >
        <Text style={styles.buttonText}>Enviar respuesta</Text>
      </TouchableOpacity>
      <View style={styles.consejosBox}>
        <Text style={styles.consejosTitle}>💡 Consejos:</Text>
        <Text style={styles.consejosText}>
          • Piensa en los momentos especiales que compartieron{"\n"}
          • La respuesta puede estar relacionada con lugares, fechas o frases importantes{"\n"}
          • Tienes 3 intentos para acertar
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg1, padding: 24 },
  albumTitle: { fontSize: 22, color: palette.pink, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  retoNum: { color: palette.text, fontSize: 15, textAlign: "center", marginBottom: 8 },
  retoBox: { backgroundColor: "#fff0fa", borderRadius: 12, padding: 18, marginBottom: 12, maxWidth: 400, alignSelf: "center" },
  retoPregunta: { color: palette.pink, fontWeight: "bold", fontSize: 18, marginBottom: 6, textAlign: "center" },
  retoTipo: { color: palette.text, fontSize: 14, textAlign: "center" },
  input: {
    borderWidth: 2,
    borderColor: palette.pink,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    color: palette.pink,
    backgroundColor: "#fff",
    marginBottom: 16,
    marginTop: 8,
    maxWidth: 260,
    alignSelf: "center",
  },
  button: {
    backgroundColor: palette.pink,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 18,
    marginTop: 8,
    maxWidth: 260,
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" },
  consejosBox: {
    backgroundColor: "#f3f6ff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  consejosTitle: { color: palette.text, fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  consejosText: { color: palette.text, fontSize: 14 },
  recuerdoBox: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.bg1, padding: 24 },
  correcto: { color: "#2ecc71", fontWeight: "bold", fontSize: 22, marginBottom: 8 },
  recuerdoTitle: { color: palette.pink, fontWeight: "bold", fontSize: 20, marginBottom: 12 },
  recuerdoCard: { backgroundColor: "#fff", borderRadius: 12, padding: 18, marginBottom: 16, alignItems: "center" },
  recuerdoImg: { color: palette.text, fontSize: 16 },
  recuerdoNote: { color: palette.text, fontSize: 16 },
});