import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { useRoute } from "@react-navigation/native";
import { palette } from "./MisAlbumesScreen";
import LottieView from "lottie-react-native";

const BACKEND_URL = "https://php-laravel-docker-j6so.onrender.com";

export default function AlbumCompletoScreen() {
  const route = useRoute();
  const { album } = route.params as any;
  const recuerdos = album.challenges.flatMap((c: any) => c.memories);
  const [showSparkle, setShowSparkle] = React.useState(true);

  // Filtro
  const [filtro, setFiltro] = useState<"todos" | "photo" | "video" | "note">("todos");

  React.useEffect(() => {
    setShowSparkle(true);
    const timer = setTimeout(() => setShowSparkle(false), 6000); // antes 3500
    return () => clearTimeout(timer);
  }, []);

  // Filtrar recuerdos
  const recuerdosFiltrados = filtro === "todos"
    ? recuerdos
    : recuerdos.filter((r: any) => r.type === filtro);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg1, position: "relative" }}>
      {showSparkle && (
        <>
          {/* Animación central - full screen, ligera escala para más "zoom" */}
          <LottieView
            source={require("../assets/Sparkle.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: 999, pointerEvents: "none", transform: [{ scale: 1.05 }] }
            ]}
          />

          {/* Esquinas/pequeñas pero más grandes */}
          <LottieView
            source={require("../assets/Fireworks.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 220,
              height: 220,
              zIndex: 999,
              pointerEvents: "none",
              transform: [{ scale: 1.05 }]
            }}
          />
          <LottieView
            source={require("../assets/Birthday.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 220,
              height: 220,
              zIndex: 999,
              pointerEvents: "none",
              transform: [{ scale: 1.05 }]
            }}
          />

          {/* Nuevas animaciones aumentadas y mejor posicionadas */}
          <LottieView
            source={require("../assets/pulpo.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 220,
              height: 220,
              zIndex: 998,
              pointerEvents: "none",
              transform: [{ scale: 1.1 }]
            }}
          />

          <LottieView
            source={require("../assets/Frubana.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              bottom: 28,
              left: 18,
              width: 220,
              height: 220,
              zIndex: 998,
              pointerEvents: "none",
              transform: [{ scale: 1.1 }]
            }}
          />

          <LottieView
            source={require("../assets/flowers (2).json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              left: 30,
              top: 160,
              width: 180,
              height: 180,
              zIndex: 997,
              pointerEvents: "none",
              transform: [{ scale: 1.05 }]
            }}
          />

          <LottieView
            source={require("../assets/Flowers (1).json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              right: 30,
              top: 160,
              width: 180,
              height: 180,
              zIndex: 997,
              pointerEvents: "none",
              transform: [{ scale: 1.05 }]
            }}
          />

          <LottieView
            source={require("../assets/Flowers.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              left: 60,
              bottom: 140,
              width: 160,
              height: 160,
              zIndex: 997,
              pointerEvents: "none",
              transform: [{ scale: 1.05 }]
            }}
          />

          <LottieView
            source={require("../assets/Cherry Blossom.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              top: 8,
              left: "28%",
              width: 240,
              height: 240,
              zIndex: 996,
              pointerEvents: "none",
              transform: [{ scale: 1.08 }]
            }}
          />

          {/* Tulipanes: grande y centrado, con más zoom */}
          <LottieView
            source={require("../assets/Tulipan.json")}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={{
              position: "absolute",
              bottom: -40,
              left: 0,
              width: "100%",
              height: 760,
              zIndex: 995,
              pointerEvents: "none",
              transform: [{ scale: 1.08 }]
            }}
          />
        </>
      )}
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.subtitle}>{album.description}</Text>

        {/* Filtro */}
        <View style={styles.filtroRow}>
          <FiltroBtn label="Todos" active={filtro === "todos"} onPress={() => setFiltro("todos")} />
          <FiltroBtn label="Fotos" active={filtro === "photo"} onPress={() => setFiltro("photo")} />
          <FiltroBtn label="Videos" active={filtro === "video"} onPress={() => setFiltro("video")} />
          <FiltroBtn label="Notas" active={filtro === "note"} onPress={() => setFiltro("note")} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsBox}>
            <Text style={styles.statsNum}>
              {recuerdos.filter((r: any) => r.type === "photo").length}
            </Text>
            <Text style={styles.statsLabel}>Fotos</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsNum}>
              {recuerdos.filter((r: any) => r.type === "video").length}
            </Text>
            <Text style={styles.statsLabel}>Videos</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsNum}>
              {recuerdos.filter((r: any) => r.type === "note").length}
            </Text>
            <Text style={styles.statsLabel}>Notas</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsNum}>{recuerdos.length}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </View>
        </View>
        <View style={styles.recuerdosGrid}>
          {recuerdosFiltrados.map((r: any, i: number) => (
            <View key={i} style={styles.recuerdoCard}>
              {r.type === "photo" && (() => {
                const uri = r.file_path && (r.file_path.startsWith('http') ? r.file_path : `${BACKEND_URL}/storage/${r.file_path}`);
                return (
                  <Image
                    source={{ uri }}
                    style={{ width: 180, height: 120, borderRadius: 10, marginBottom: 8 }}
                    resizeMode="cover"
                  />
                );
              })()}
              {r.type === "note" && <Text style={styles.recuerdoNote}>{r.note}</Text>}
              {r.type === "video" && (() => {
                const uri = r.file_path && (r.file_path.startsWith('http') ? r.file_path : `${BACKEND_URL}/storage/${r.file_path}`);
                return (
                  <Video
                    source={{ uri }}
                    style={{ width: 180, height: 120, borderRadius: 10, marginBottom: 8 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                );
              })()}
            </View>
          ))}
        </View>
        {/* Mensaje de agradecimiento */}
        <Text style={styles.gracias}>
          ¡Gracias por este viaje especial!{"\n"}
          Has desbloqueado todos los recuerdos de este álbum. Cada respuesta correcta reveló un momento especial que alguien quiso compartir contigo. ¡Espero que hayas disfrutado esta experiencia! 💕
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FiltroBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[
        styles.filtroBtn,
        { backgroundColor: active ? palette.pink : "#fff", borderColor: palette.pink },
      ]}
      onPress={onPress}
    >
      <Text style={{ color: active ? "#fff" : palette.pink, fontWeight: "bold" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: palette.pink, fontWeight: "bold", marginTop: 24, textAlign: "center" },
  subtitle: { color: palette.text, fontSize: 15, marginBottom: 18, textAlign: "center" },
  filtroRow: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  filtroBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 18 },
  statsBox: { backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center", minWidth: 70 },
  statsNum: { color: palette.pink, fontWeight: "bold", fontSize: 20 },
  statsLabel: { color: palette.text, fontSize: 13 },
  recuerdosGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  recuerdoCard: { backgroundColor: "#fff", borderRadius: 12, padding: 18, margin: 8, minWidth: 140, alignItems: "center" },
  recuerdoImg: { color: palette.text, fontSize: 16 },
  recuerdoNote: { color: palette.text, fontSize: 16 },
  gracias: { color: palette.text, fontSize: 16, marginTop: 24, textAlign: "center", paddingHorizontal: 16 },
});