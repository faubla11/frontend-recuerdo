import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  Image,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_ROUTES } from "../api/routes";
import { useUser } from "../contexts/UserContext";
import { SUPABASE } from "../config";
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY);

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
  yellow: "#fffbe0",
  green: "#4caf50",
};

type Memory = {
  type: "photo" | "video" | "note";
  uri?: string;
  name?: string;
  note?: string;
};

export default function AddMemoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { token } = useUser();

  // Recibe el reto por params
  const { challenge } = route.params as { challenge: { id: number; question: string } };

  const [memories, setMemories] = useState<Memory[]>([]);
  const [note, setNote] = useState("");

  // Responsivo: ancho de la tarjeta
  const cardWidth = width > 700 ? 500 : width > 500 ? 400 : "95%";

  // Subir foto
  const pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMemories([...memories, { type: "photo", uri: result.assets[0].uri, name: result.assets[0].fileName || "Foto" }]);
    }
  };

  // Subir video
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMemories([...memories, { type: "video", uri: result.assets[0].uri, name: result.assets[0].fileName || "Video" }]);
    }
  };

  // Añadir nota
  const addNote = () => {
    if (note.trim().length === 0) return;
    setMemories([...memories, { type: "note", note }]);
    setNote("");
  };

  // Eliminar recuerdo
  const removeMemory = (idx: number) => {
    setMemories(memories.filter((_, i) => i !== idx));
  };

  // Guardar recuerdos (aquí deberías hacer el POST al backend)
  const saveMemories = async () => {
    if (memories.length === 0) {
      Alert.alert("Agrega al menos un recuerdo");
      return;
    }

    let success = true;

    for (const mem of memories) {
      try {
        if (mem.type === "note") {
          const res = await fetch(API_ROUTES.ADD_MEMORY(challenge.id), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ type: "note", note: mem.note }),
          });
          if (!res.ok) success = false;
        } else if (mem.uri) {
          // Direct upload to Supabase using anon key (bucket must be public or allow anon upload)
          try {
            const ext = (mem.name || '').split('.').pop() || (mem.type === 'photo' ? 'jpg' : 'mp4');
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            // Read file as base64 (expo-file-system) and convert to Buffer
            // Some TypeScript setups don't expose EncodingType on expo-file-system typings.
            // Use the literal 'base64' and cast to any to avoid the TS error while keeping runtime behavior.
            const b64 = await FileSystem.readAsStringAsync(mem.uri, { encoding: 'base64' as any });
            const fileBuffer = Buffer.from(b64, 'base64');

            const { data, error } = await supabase.storage.from(SUPABASE.BUCKET).upload(filename, fileBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: mem.type === 'photo' ? 'image/jpeg' : 'video/mp4',
            });

            if (error) {
              console.error('Supabase upload error', error);
              Alert.alert('Error', 'No se pudo subir el archivo a Supabase');
              success = false;
              continue;
            }

            const { data: publicData } = supabase.storage.from(SUPABASE.BUCKET).getPublicUrl(data.path);
            const publicUrl = publicData?.publicUrl;

            if (!publicUrl) {
              Alert.alert('Error', 'No se pudo obtener la URL pública del archivo');
              success = false;
              continue;
            }

            const createRes = await fetch(API_ROUTES.ADD_MEMORY(challenge.id), {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: mem.type, file_url: publicUrl }),
            });
            if (!createRes.ok) {
              Alert.alert('Error', 'No se pudo registrar el recuerdo en el servidor');
              success = false;
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Ocurrió un error al subir el archivo');
            success = false;
          }
        }
      } catch (e) {
        console.error(e);
        success = false;
      }
    }

    if (success) {
      Alert.alert("Recuerdos guardados", `Has añadido ${memories.length} recuerdos`);
      navigation.goBack();
    } else {
      Alert.alert("Error", "No se pudieron guardar todos los recuerdos");
    }
  };

  return (
    <LinearGradient colors={[palette.bg1, palette.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
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
            {/* Header */}
            <Text style={styles.title}>Añadir Recuerdos</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.questionLabel}>Reto:</Text> {challenge.question}
            </Text>
            <Text style={styles.helpText}>
              Estos recuerdos se desbloquearán cuando respondan: <Text style={{ color: palette.accent2, fontWeight: "700" }}>{challenge.question}</Text>
            </Text>

            {/* Subir foto */}
            <TouchableOpacity style={styles.uploadBox} onPress={pickPhoto}>
              <View style={styles.uploadIconBox}>
                <Ionicons name="camera" size={28} color="#d726a1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>Subir Foto</Text>
                <Text style={styles.uploadDesc}>Añade fotos especiales</Text>
              </View>
              <Ionicons name="cloud-upload-outline" size={22} color={palette.accent2} />
            </TouchableOpacity>

            {/* Subir video */}
            <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
              <View style={styles.uploadIconBox}>
                <Ionicons name="videocam" size={28} color="#7e30e1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>Subir Video</Text>
                <Text style={styles.uploadDesc}>Añade videos memorables</Text>
              </View>
              <Ionicons name="cloud-upload-outline" size={22} color={palette.accent2} />
            </TouchableOpacity>

            {/* Añadir nota */}
            <View style={styles.noteBox}>
              <View style={styles.noteHeader}>
                <MaterialCommunityIcons name="note-edit" size={22} color="#ffb300" />
                <Text style={styles.noteTitle}>Añadir Nota</Text>
                <Text style={styles.noteDesc}>Escribe un mensaje especial</Text>
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Escribe un mensaje especial, una anécdota, o cualquier cosa que quieras compartir..."
                placeholderTextColor={palette.muted}
                value={note}
                onChangeText={setNote}
                multiline
              />
              <TouchableOpacity style={styles.noteBtn} onPress={addNote}>
                <Text style={styles.noteBtnText}>Añadir Nota</Text>
              </TouchableOpacity>
            </View>

            {/* Recuerdos añadidos */}
            <Text style={styles.memoriesTitle}>
              Recuerdos añadidos <Text style={styles.memoriesCount}>{memories.length > 0 ? `(${memories.length})` : ""}</Text>
            </Text>
            {memories.map((mem, idx) => (
              <View key={idx} style={styles.memoryItem}>
                <View style={styles.memoryIconBox}>
                  {mem.type === "photo" && <Ionicons name="image" size={22} color="#d726a1" />}
                  {mem.type === "video" && <Ionicons name="videocam" size={22} color="#7e30e1" />}
                  {mem.type === "note" && <MaterialCommunityIcons name="note-text" size={22} color="#ffb300" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memoryType}>
                    {mem.type === "photo" && "Photo"}
                    {mem.type === "video" && "Video"}
                    {mem.type === "note" && "Note"}
                  </Text>
                  <Text style={styles.memoryDesc}>
                    {mem.type === "note" ? mem.note : mem.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMemory(idx)}>
                  <Ionicons name="close" size={22} color={palette.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Guardar recuerdos */}
            <TouchableOpacity style={styles.saveBtn} onPress={saveMemories}>
              <Text style={styles.saveBtnText}>Guardar recuerdos{memories.length > 0 ? ` (${memories.length})` : ""}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 28,
    maxWidth: 600,
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
    marginBottom: 2,
  },
  subtitle: {
    color: "#b06fc9",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  questionLabel: {
    color: palette.accent,
    fontWeight: "700",
  },
  helpText: {
    color: palette.muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff6fb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f3e6fa",
  },
  uploadIconBox: {
    backgroundColor: "#ffe4f3",
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  uploadTitle: {
    color: palette.accent2,
    fontWeight: "700",
    fontSize: 15,
  },
  uploadDesc: {
    color: palette.muted,
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: palette.yellow,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffe9b3",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  noteTitle: {
    color: "#ffb300",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
  },
  noteDesc: {
    color: palette.muted,
    fontSize: 13,
    marginLeft: 8,
  },
  noteInput: {
    backgroundColor: "#fff",
    borderColor: "#ffe9b3",
    borderWidth: 1,
    color: palette.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 6,
    fontSize: 15,
    minHeight: 50,
  },
  noteBtn: {
    backgroundColor: "#ffb300",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  noteBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  memoriesTitle: {
    color: palette.text,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 15,
  },
  memoriesCount: {
    color: palette.green,
    fontWeight: "700",
    fontSize: 13,
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf6ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e5d0f7",
  },
  memoryIconBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    marginRight: 10,
  },
  memoryType: {
    color: palette.accent2,
    fontWeight: "700",
    fontSize: 14,
  },
  memoryDesc: {
    color: palette.text,
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: palette.accent2,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});