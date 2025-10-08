import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Dimensions, Platform, Modal, Linking, ScrollView } from "react-native";
import { API_ROUTES } from "../api/routes";
import { useUser } from '../contexts/UserContext';
import { useNavigation, useRoute } from "@react-navigation/native";
import { palette } from "./MisAlbumesScreen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from 'expo-media-library';
import ConfettiCannon from "react-native-confetti-cannon";
import ImageViewing from "react-native-image-viewing";
import { Video, ResizeMode } from 'expo-av';
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";


const BACKEND_URL = "https://php-laravel-docker-j6so.onrender.com"; // Cambia esto por tu URL real

export default function RetosAventuraScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { album } = route.params as any;
  const { token } = useUser();
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecuerdo, setShowRecuerdo] = useState(false);
  const [recuerdo, setRecuerdo] = useState<any>(null);
  const [showImage, setShowImage] = useState(false);
  const [imageToShow, setImageToShow] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const retos = album.challenges;
  const reto = retos[current];

  const handleResponder = async () => {
    setLoading(true);
    const res = await fetch(API_ROUTES.VALIDATE_CHALLENGE(reto.id), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: 'application/json' },
      body: JSON.stringify({ answer }),
    });
    setLoading(false);
    if (!res.ok) {
      const text = await res.text();
      console.error('VALIDATE_CHALLENGE failed', res.status, text);
      Alert.alert('Error', 'No se pudo validar la respuesta. Intenta de nuevo.');
      return;
    }
    const data = await res.json();
    if (data.correct) {
      setRecuerdo(data.memories);
      setShowRecuerdo(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      // Si este fue el último reto, notificar al backend que el álbum está completado
      try {
        const isLast = current + 1 >= retos.length;
        if (isLast && token) {
          const resp = await fetch(API_ROUTES.MARK_ALBUM_COMPLETED(album.id), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
          });
          if (!resp.ok) {
            const text = await resp.text();
            console.warn('MARK_ALBUM_COMPLETED failed', resp.status, text);
          }
        }
      } catch (e) {
        console.warn('No se pudo marcar álbum como completado:', e);
      }
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

  const handleDownload = async (uri: string) => {
    if (Platform.OS === "web") {
      // Web: descarga directa usando un enlace
      const link = document.createElement("a");
      link.href = uri;
      link.download = uri.split("/").pop() || "descarga.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert("Descarga iniciada", "La imagen se descargará en tu navegador.");
    } else {
      // Móvil: descarga usando FileSystem y guarda en la galería con expo-media-library
      try {
        const filename = uri.split("/").pop() || "descarga.jpg";
        const downloadPath = FileSystem.cacheDirectory + filename;

        // Pedir permiso para acceder a la galería
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos permiso para guardar el archivo en tu galería.');
          return;
        }

        const downloadResult = await FileSystem.downloadAsync(uri, downloadPath);

        // Crear un asset y agregarlo a un álbum llamado 'Recuerdos'
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        const albumName = 'Recuerdos';
        try {
          const album = await MediaLibrary.getAlbumAsync(albumName);
          if (album == null) {
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch (e) {
          // Si falla crear/añadir al álbum, al menos dejamos el asset en la galería
          console.warn('No se pudo crear/añadir album:', e);
        }

        Alert.alert('Descarga completa', 'El archivo se guardó en tu galería.');
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo descargar el archivo.');
      }
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Formato YYYY-MM-DD
      const formatted = selectedDate.toISOString().split("T")[0];
      setAnswer(formatted);
    }
  };

  if (!reto)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: palette.pink, fontSize: 22, textAlign: "center" }}>¡No hay retos!</Text>
      </SafeAreaView>
    );

  if (showRecuerdo) {
    const maxImageWidth = Math.min(360, Dimensions.get("window").width - 48);
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
        <Text style={styles.recuerdoTitle}>Recuerdo(s) desbloqueado(s) 🎉</Text>

        <ScrollView contentContainerStyle={{ padding: 12, alignItems: "center" }} style={{ width: "100%" }}>
          {recuerdo && recuerdo.length > 0 ? (
            recuerdo.map((mem: any, idx: number) => (
              <View key={idx} style={styles.recuerdoCard}>
                {mem.type === "photo" && (() => {
                  const uri = mem.file_path && (mem.file_path.startsWith('http') ? mem.file_path : `${BACKEND_URL}/storage/${mem.file_path}`);
                  return (
                    <>
                      <TouchableOpacity onPress={() => handleImagePress(uri)}>
                        <Image
                          source={{ uri }}
                          style={{ width: maxImageWidth, height: (maxImageWidth * 9) / 16, borderRadius: 12, marginBottom: 8 }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => handleDownload(uri)}
                      >
                        <Text style={styles.downloadBtnText}>Descargar</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
                {mem.type === "note" && <Text style={styles.recuerdoNote}>{mem.note}</Text>}
                {mem.type === "video" && (() => {
                  const uri = mem.file_path && (mem.file_path.startsWith('http') ? mem.file_path : `${BACKEND_URL}/storage/${mem.file_path}`);
                  return (
                    <Video
                      source={{ uri }}
                      style={{ width: Math.min(360, Dimensions.get("window").width - 48), height: 220, borderRadius: 12 }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  );
                })()}
              </View>
            ))
          ) : (
            <Text style={{ color: palette.text }}>No hay recuerdos desbloqueados.</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleSiguiente}>
          <Text style={styles.buttonText}>
            {current + 1 < retos.length ? "Siguiente reto" : "Ver álbum completo"}
          </Text>
        </TouchableOpacity>

        <ImageViewing
          images={imageToShow ? [{ uri: imageToShow }] : []}
          imageIndex={0}
          visible={showImage}
          onRequestClose={() => setShowImage(false)}
        />
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={answer}
          onChangeText={setAnswer}
          placeholder={
            reto.answer_type === "date"
              ? "Ejemplo: 2025-09-01"
              : "Escribe tu respuesta aquí..."
          }
          placeholderTextColor={palette.muted}
          keyboardType={reto.answer_type === "date" ? "numbers-and-punctuation" : "default"}
          editable={true} // Permite siempre editar manualmente
        />
        {reto.answer_type === "date" && (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginLeft: 8 }}>
            <MaterialCommunityIcons name="calendar" size={32} color={palette.pink} />
          </TouchableOpacity>
        )}
      </View>
      {showDatePicker && reto.answer_type === "date" && (
        <DateTimePicker
          value={answer ? new Date(answer) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const formatted = selectedDate.toISOString().split("T")[0];
              setAnswer(formatted);
            }
          }}
        />
      )}
      <TouchableOpacity
        style={[styles.button, !answer ? { opacity: 0.5 } : {}]}
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
  retoBox: { backgroundColor: "#fff0fa", borderRadius: 12, padding: 18, marginBottom: 12 },
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
  consejosBox: {
    backgroundColor: "#f3f6ff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    width: "100%",
  },
  consejosTitle: { color: palette.text, fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  consejosText: { color: palette.text, fontSize: 14 },
  recuerdoBox: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.bg1, padding: 24 },
  correcto: { color: "#2ecc71", fontWeight: "bold", fontSize: 22, marginBottom: 8 },
  recuerdoTitle: { color: palette.pink, fontWeight: "bold", fontSize: 20, marginBottom: 12 },
  recuerdoCard: { backgroundColor: "#fff", borderRadius: 12, padding: 18, marginBottom: 16, alignItems: "center" },
  recuerdoImg: { color: palette.text, fontSize: 16 },
  recuerdoNote: { color: palette.text, fontSize: 16 },
  downloadBtn: {
    backgroundColor: palette.pink,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 2,
  },
  downloadBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});