import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../contexts/UserContext";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const palette = {
  bg1: "#fff6fb",
  bg2: "#fbefff",
  accent: "#d726a1",
  accent2: "#7e30e1",
  accent3: "#ffb300",
  text: "#a100a1",
  muted: "#bfa8cc",
  card: "#fff",
  border: "#f3e6fa",
};

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useUser();

  return (
    <LinearGradient colors={[palette.bg1, palette.bg2]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="heart-circle" size={28} color={palette.accent2} />
            <Text style={styles.logoText}>Recuerdos Ocultos</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <View style={styles.logoutRow}>
              <MaterialIcons name="logout" size={20} color={palette.text} />
              <Text style={styles.logoutText}>Salir</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Saludo */}
        <Text style={styles.hello}>
          Hola, <Text style={styles.helloName}>{user?.name || "Usuario"}</Text>
        </Text>
        <Text style={styles.subtitle}>¿Qué te gustaría hacer hoy?</Text>

        {/* Tarjetas */}
        <View style={styles.cards}>
          <ActionCard
            icon={<Ionicons name="add" size={28} color="#fff" />}
            iconBg={palette.accent}
            title="Crear Álbum"
            desc="Crea un nuevo álbum con recuerdos ocultos"
            onPress={() => navigation.navigate("CrearAlbum")}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="folder-multiple" size={28} color="#fff" />}
            iconBg={palette.accent2}
            title="Mis Álbumes"
            desc="Ve y gestiona tus álbumes creados"
            onPress={() => navigation.navigate("MisAlbumes")}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="pound" size={28} color="#fff" />}
            iconBg={palette.accent3}
            title="Ingresar Código"
            desc="Desbloquea recuerdos con un código especial"
            onPress={() => navigation.navigate("IngresarCodigo")}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ActionCard({ icon, iconBg, title, desc, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={20} color="#e91e63" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 36,
    alignItems: "stretch",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    marginLeft: 8,
  },
  logoutRow: { flexDirection: "row", alignItems: "center" },
  logoutText: {
    color: palette.text,
    fontWeight: "600",
    marginLeft: 4,
  },
  hello: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 2,
  },
  helloName: {
    color: palette.accent,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    marginBottom: 24,
  },
  cards: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginLeft: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: palette.text,
  },
  cardDesc: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 2,
  },
});
