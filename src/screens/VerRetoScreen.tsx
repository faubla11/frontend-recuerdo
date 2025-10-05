import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_ROUTES } from "../api/routes";
import { palette } from "./VerRetosScreen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../contexts/UserContext";

export default function VerRetoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = useUser();
  const { challengeId } = route.params as { challengeId: number };

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTES.GET_CHALLENGE(challengeId), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setChallenge)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color={palette.accent2} style={{ flex: 1 }} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={palette.accent2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Reto</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.type}>
          {challenge.answer_type === "text" && "Respuesta Libre"}
          {challenge.answer_type === "date" && "Fecha"}
          {challenge.answer_type === "exact" && "Frase"}
        </Text>
        <Text style={styles.question}>{challenge.question}</Text>
        <Text style={styles.label}>Respuesta protegida</Text>
        <Text style={styles.date}>
          Creado {new Date(challenge.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.label}>Recuerdos asociados:</Text>
        <View style={styles.memories}>
          {challenge.memories.map((mem: any) => (
            <View key={mem.id} style={styles.memoryTag}>
              {mem.type === "photo" && (
                <MaterialCommunityIcons name="image" size={18} color={palette.accent2} />
              )}
              {mem.type === "video" && (
                <MaterialCommunityIcons name="video" size={18} color={palette.accent2} />
              )}
              {mem.type === "note" && (
                <MaterialCommunityIcons name="note-text" size={18} color={palette.accent3} />
              )}
              <Text style={styles.memoryTagText}>
                {mem.type === "note" ? "📝 Nota recuerdo" : mem.file_path?.split("/").pop()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: palette.bg1,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.accent2,
    flex: 1,
    textAlign: "center",
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    margin: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  type: {
    color: palette.accent2,
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
  },
  question: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 2,
  },
  date: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  memories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  memoryTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.purple,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  memoryTagText: {
    color: palette.accent2,
    fontSize: 12,
    marginLeft: 4,
  },
});