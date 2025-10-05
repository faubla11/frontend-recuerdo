import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { palette } from "./MisAlbumesScreen";
import LottieView from "lottie-react";

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
    const timer = setTimeout(() => setShowSparkle(false), 6000);
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
            animationData={require("../assets/Sparkle.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          {/* Esquinas/pequeñas pero más grandes */}
          <LottieView
            animationData={require("../assets/Fireworks.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 220,
              height: 220,
              zIndex: 999,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          <LottieView
            animationData={require("../assets/Birthday.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 220,
              height: 220,
              zIndex: 999,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          {/* Nuevas animaciones aumentadas y mejor posicionadas */}
          <LottieView
            animationData={require("../assets/pulpo.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 220,
              height: 220,
              zIndex: 998,
              pointerEvents: "none",
              transform: "scale(1.1)",
            }}
          />
          <LottieView
            animationData={require("../assets/Frubana.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              bottom: 28,
              left: 18,
              width: 220,
              height: 220,
              zIndex: 998,
              pointerEvents: "none",
              transform: "scale(1.1)",
            }}
          />
          <LottieView
            animationData={require("../assets/flowers (2).json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              left: 30,
              top: 160,
              width: 180,
              height: 180,
              zIndex: 997,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          <LottieView
            animationData={require("../assets/Flowers (1).json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              right: 30,
              top: 160,
              width: 180,
              height: 180,
              zIndex: 997,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          <LottieView
            animationData={require("../assets/Flowers.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              left: 60,
              bottom: 140,
              width: 160,
              height: 160,
              zIndex: 997,
              pointerEvents: "none",
              transform: "scale(1.05)",
            }}
          />
          <LottieView
            animationData={require("../assets/Cherry Blossom.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              top: 8,
              left: "28%",
              width: 240,
              height: 240,
              zIndex: 996,
              pointerEvents: "none",
              transform: "scale(1.08)",
            }}
          />
          {/* Tulipanes: grande y centrado, con más zoom */}
          <LottieView
            animationData={require("../assets/Tulipan.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              bottom: -40,
              left: 0,
              width: "100vw",
              height: 760,
              zIndex: 995,
              pointerEvents: "none",
              transform: "scale(1.08)",
            }}
          />
        </>
      )}
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.subtitle}>{album.description}</Text>
        {/* Filtro */}
        <div style={filterStyles.row}>
          <button
            style={filterStyles.btn(filtro === "todos")}
            onClick={() => setFiltro("todos")}
          >
            Todos
          </button>
          <button
            style={filterStyles.btn(filtro === "photo")}
            onClick={() => setFiltro("photo")}
          >
            Fotos
          </button>
          <button
            style={filterStyles.btn(filtro === "video")}
            onClick={() => setFiltro("video")}
          >
            Videos
          </button>
          <button
            style={filterStyles.btn(filtro === "note")}
            onClick={() => setFiltro("note")}
          >
            Notas
          </button>
        </div>
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
                  <video src={uri} controls style={{ width: 180, height: 120, borderRadius: 10, marginBottom: 8 }} />
                );
              })()}
            </View>
          ))}
        </View>
        {/* Mensaje de agradecimiento en tarjeta */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.text}>
            ¡Gracias por este viaje especial!{"\n"}
            Has desbloqueado todos los recuerdos de este álbum. Cada respuesta correcta reveló un momento especial que alguien quiso compartir contigo. ¡Espero que hayas disfrutado esta experiencia! 💕
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: palette.pink, fontWeight: "bold", marginTop: 24, textAlign: "center" },
  subtitle: { color: palette.text, fontSize: 15, marginBottom: 18, textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 18 },
  statsBox: { backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center", minWidth: 70 },
  statsNum: { color: palette.pink, fontWeight: "bold", fontSize: 20 },
  statsLabel: { color: palette.text, fontSize: 13 },
  recuerdosGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  recuerdoCard: { backgroundColor: "#fff", borderRadius: 12, padding: 18, margin: 8, minWidth: 140, alignItems: "center" },
  recuerdoImg: { color: palette.text, fontSize: 16 },
  recuerdoNote: { color: palette.text, fontSize: 16 },
});

// Filtro con estilos visuales para web
const filterStyles = {
  row: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "center",
    marginBottom: 18,
    gap: 8,
  },
  btn: (active: boolean) => ({
    background: active ? palette.pink : "#fff",
    color: active ? "#fff" : palette.pink,
    border: `1px solid ${palette.pink}`,
    borderRadius: 8,
    padding: "8px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    outline: "none",
    marginRight: 8,
    transition: "background 0.2s, color 0.2s",
  }),
};

// Tarjeta visual para el mensaje de agradecimiento
const cardStyles = {
  card: {
    backgroundColor: "#fff0fa",
    borderColor: palette.pink,
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    marginBottom: 32,
    maxWidth: 500,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: "center",
    alignItems: "center",
  } as const,
  text: {
    color: palette.pink,
    fontSize: 18,
    textAlign: "center" as const,
    fontWeight: "bold" as const,
  },
};