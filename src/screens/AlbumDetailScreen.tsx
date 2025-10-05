import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Clipboard,
  Alert,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // Ajusta la ruta si es necesario

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
  green: "#4caf50",
  purple: "#e6e6fa",
  pink: "#ffe4f3",
  yellow: "#fffbe0",
};

export default function AlbumDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { width } = useWindowDimensions();

  // Recibe el álbum por params
  const { album } = route.params as {
    album: {
      id: number;
      title: string;
      description?: string;
      category: string;
      code: string;
      share_url: string;
      retos_count?: number;
      veces_resuelto?: number;
    };
  };

  // Copiar código o link
  const copyToClipboard = (text: string, msg: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert("Copiado", msg);
  };

  // Responsivo: ancho de la tarjeta
  const cardWidth = width > 700 ? 500 : width > 500 ? 400 : "95%";

  return (
    <LinearGradient colors={[palette.bg1, palette.bg2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <Text style={styles.icon}>💖</Text>
              <Text style={styles.icon}>🎁</Text>
              <Text style={styles.headerTitle}>Recuerdos Ocultos</Text>
            </View>
            <View style={{ width: 22 }} />
          </View>

          {/* Card */}
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.albumTitle}>{album.title}</Text>
            <Text style={styles.albumDesc}>{album.description}</Text>
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Álbum creado exitosamente</Text>
            </View>

            {/* Código del álbum */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>Código del álbum</Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={styles.codeInput}
                  value={album.code}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  onPress={() => copyToClipboard(album.code, "Código copiado")}
                >
                  <Feather name="copy" size={22} color={palette.accent2} />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionHelp}>
                Comparte este código para que puedan acceder a tus recuerdos
              </Text>
            </View>

            {/* Link para compartir */}
            <View style={[styles.sectionBox, { backgroundColor: palette.purple }]}>
              <Text style={styles.sectionLabel}>Link para compartir</Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={styles.linkInput}
                  value={album.share_url}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  onPress={() => copyToClipboard(album.share_url, "Enlace copiado")}
                >
                  <Feather name="share-2" size={22} color={palette.accent2} />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionHelp}>
                O envía este enlace directo para acceder al álbum
              </Text>
            </View>

            {/* Botones */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("AddChallenge", { album })} // <-- pasa el álbum por params
            >
              <LinearGradient
                colors={["#d726a1", "#7e30e1"]}
                style={styles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryBtnText}>+ Añadir Reto</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("VerRetos", { album })}
            >
              <Text style={styles.secondaryBtnText}>Ver Retos</Text>
            </TouchableOpacity>

            {/* Estadísticas */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{album.retos_count ?? 0}</Text>
                <Text style={styles.statLabel}>Retos creados</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{album.veces_resuelto ?? 0}</Text>
                <Text style={styles.statLabel}>Veces resuelto</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🧭 Siguiente paso</Text>
              <Text style={styles.infoText}>
                Añade retos y recuerdos para que esa persona especial pueda desbloquearlos. ¡Haz que cada recuerdo sea una sorpresa!
              </Text>
            </View>
          </View>
        </ScrollView>
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
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: { fontSize: 22, marginHorizontal: 2 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.accent2,
    marginLeft: 6,
  },
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
  albumTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.accent2,
    textAlign: "center",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  albumDesc: {
    color: "#b06fc9",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
  },
  successBox: {
    backgroundColor: "#e0ffe0",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
    marginBottom: 14,
  },
  successText: {
    color: palette.green,
    fontWeight: "700",
    fontSize: 14,
  },
  sectionBox: {
    backgroundColor: palette.pink,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffd1e8",
  },
  sectionLabel: {
    color: palette.accent2,
    fontWeight: "700",
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  codeInput: {
    flex: 1,
    fontSize: 22,
    color: palette.accent2,
    fontWeight: "700",
    letterSpacing: 2,
    padding: 6,
    backgroundColor: "transparent",
  },
  linkInput: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
    padding: 6,
    backgroundColor: "transparent",
  },
  sectionHelp: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 8,
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
  secondaryBtn: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.accent2,
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  secondaryBtnText: {
    color: palette.accent2,
    fontWeight: "700",
    fontSize: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.accent2,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: palette.yellow,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ffe9b3",
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