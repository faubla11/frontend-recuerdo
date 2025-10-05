import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_ROUTES } from "../api/routes";
import { useUser } from "../contexts/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // Ajusta la ruta si tu tipo está en otro archivo
import { SafeAreaView } from "react-native-safe-area-context";

export const palette = {
  bg1: "#fff6fb",
  bg2: "#fbefff",
  accent: "#d726a1",
  accent2: "#a100a1",
  accent3: "#ffb300",
  text: "#a100a1",
  muted: "#bfa8cc",
  card: "#fff",
  border: "#e5d0f7",
  error: "#ffb0b0",
  yellow: "#fffbe0",
  purple: "#e6e6fa",
  green: "#4caf50",
};

const FILTERS = [
  { label: "Todos", value: "all", icon: "filter-variant" },
  { label: "Texto", value: "text", icon: "format-text" },
  { label: "Fecha", value: "date", icon: "calendar" },
  { label: "Frase", value: "exact", icon: "format-quote-close" },
];

export default function VerRetosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { token } = useUser();
  const { album } = route.params as { album: { id: number; title: string } };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(API_ROUTES.GET_CHALLENGES(album.id), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (challengeId: number) => {
    Alert.alert(
      "Eliminar reto",
      "¿Estás seguro de que deseas eliminar este reto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await fetch(API_ROUTES.DELETE_CHALLENGE(challengeId), {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
            setData({
              ...data,
              album: {
                ...data.album,
                challenges: data.album.challenges.filter((c: any) => c.id !== challengeId)
              }
            });
          }
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" color={palette.accent2} style={{ flex: 1 }} />;

  const summary = data.album.summary;

  const challenges = filter === "all"
    ? data.album.challenges
    : data.album.challenges.filter((c: any) => c.answer_type === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg1 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={palette.accent2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Retos del Álbum</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddChallenge", {
              album: {
                id: data.album.id,
                title: data.album.title,
                description: data.album.description,
                category: data.album.category,
                code: data.album.code,
                share_url: data.album.share_url,
                retos_count: data.album.summary?.total_retos,
                veces_resuelto: 0, // o el valor real si lo tienes
              }
            })}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Agregar Reto</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen del álbum */}
        <View style={styles.albumSummary}>
          <View>
            <Text style={styles.albumTitle}>{data.album.title}</Text>
            <Text style={styles.albumDesc}>{data.album.description}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={palette.accent2} />
              <Text style={styles.summaryValue}>{summary.total_retos}</Text>
              <Text style={styles.summaryLabel}>Total Retos</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="image-multiple" size={24} color={palette.accent2} />
              <Text style={styles.summaryValue}>{summary.total_recuerdos}</Text>
              <Text style={styles.summaryLabel}>Recuerdos</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="format-text" size={24} color={palette.accent2} />
              <Text style={styles.summaryValue}>{summary.total_texto}</Text>
              <Text style={styles.summaryLabel}>Texto Libre</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="calendar" size={24} color={palette.accent2} />
              <Text style={styles.summaryValue}>{summary.total_fecha}</Text>
              <Text style={styles.summaryLabel}>Fechas</Text>
            </View>
          </View>
          <Text style={styles.albumCode}>Código del álbum: <Text style={{ color: palette.accent2 }}>{data.album.code}</Text></Text>
        </View>

        {/* Filtros */}
        <View style={styles.filterBar}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                filter === f.value && { backgroundColor: palette.accent2 }
              ]}
              onPress={() => setFilter(f.value)}
            >
              <MaterialCommunityIcons
                name={f.icon as any}
                size={18}
                color={filter === f.value ? "#fff" : palette.accent2}
              />
              <Text style={[
                styles.filterBtnText,
                filter === f.value && { color: "#fff" }
              ]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de retos */}
        <View style={styles.challengeList}>
          {challenges.map((challenge: any) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeType}>
                  {challenge.answer_type === "text" && "Respuesta Libre"}
                  {challenge.answer_type === "date" && "Fecha"}
                  {challenge.answer_type === "exact" && "Frase"}
                </Text>
                <Text style={styles.challengeDate}>
                  Creado {new Date(challenge.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.challengeQuestion}>{challenge.question}</Text>
              <View style={styles.challengeMemories}>
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
              <View style={styles.memoryCount}>
                <Text style={styles.memoryCountText}>{challenge.memories.length} recuerdo{challenge.memories.length !== 1 ? "s" : ""}</Text>
              </View>
              <View style={styles.challengeActions}>
                <TouchableOpacity onPress={() => navigation.navigate("VerReto", { challengeId: challenge.id })}>
                  <Ionicons name="eye" size={20} color={palette.accent2} style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("EditarReto", { challenge })}>
                  <Ionicons name="pencil" size={20} color={palette.accent3} style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(challenge.id)}>
                  <Ionicons name="trash" size={20} color={palette.error} style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Resumen final */}
        <View style={styles.finalSummary}>
          <View style={styles.finalSummaryItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color={palette.accent2} />
            <Text style={styles.finalSummaryValue}>{summary.total_retos}</Text>
            <Text style={styles.finalSummaryLabel}>Retos totales</Text>
          </View>
          <View style={styles.finalSummaryItem}>
            <MaterialCommunityIcons name="image-multiple" size={28} color={palette.accent2} />
            <Text style={styles.finalSummaryValue}>{summary.total_recuerdos}</Text>
            <Text style={styles.finalSummaryLabel}>Recuerdos guardados</Text>
          </View>
          <View style={styles.finalSummaryItem}>
            <MaterialCommunityIcons name="account-key" size={28} color={palette.accent2} />
            <Text style={styles.finalSummaryValue}>{data.album.code}</Text>
            <Text style={styles.finalSummaryLabel}>Código del álbum</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 22,
    fontWeight: "bold",
    color: palette.accent2,
    flex: 1,
    textAlign: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.accent2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  albumSummary: {
    backgroundColor: palette.card,
    borderRadius: 16,
    margin: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.accent2,
  },
  albumDesc: {
    color: palette.text,
    fontSize: 14,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.accent2,
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 12,
  },
  albumCode: {
    color: palette.text,
    fontSize: 13,
    marginTop: 8,
    textAlign: "right",
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
    gap: 8,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.purple,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnText: {
    color: palette.accent2,
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  challengeList: {
    marginHorizontal: 16,
  },
  challengeCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  challengeType: {
    color: palette.accent2,
    fontWeight: "bold",
    fontSize: 13,
    backgroundColor: palette.purple,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  challengeDate: {
    color: palette.muted,
    fontSize: 12,
  },
  challengeQuestion: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  challengeMemories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  memoryCount: {
    backgroundColor: palette.green,
    borderRadius: 6,
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  memoryCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  challengeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  finalSummary: {
    backgroundColor: palette.card,
    borderRadius: 16,
    margin: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  finalSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  finalSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.accent2,
  },
  finalSummaryLabel: {
    color: palette.muted,
    fontSize: 12,
    textAlign: "center",
  },
});