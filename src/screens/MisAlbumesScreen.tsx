import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, Platform, Dimensions, ScrollView, ImageBackground, Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_ROUTES } from "../api/routes";
import { useUser } from "../contexts/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { SUPABASE } from "../config";
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY);

const API_BASE = "https://php-laravel-docker-j6so.onrender.com";

export const palette = {
  bg1: "#fff6fb",
  accent: "#d726a1",
  accent2: "#7e30e1",
  accent3: "#ffb300",
  text: "#a100a1",
  muted: "#bfa8cc",
  card: "#fff",
  border: "#e5d0f7",
  error: "#ffb0b0",
  purple: "#e6e6fa",
  pink: "#a100a1",
};

const CATEGORIES = [
  { label: "Todos", value: "all", icon: "filter-variant" },
  { label: "Amor", value: "amor", icon: "heart" },
  { label: "Familia", value: "familia", icon: "account-group" },
  { label: "Viaje", value: "viaje", icon: "airplane" },
  { label: "Otro", value: "otro", icon: "dots-horizontal" },
];

export default function MisAlbumesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useUser();

  const [albums, setAlbums] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (showCompletedOnly) {
          const res = await fetch(API_ROUTES.GET_COMPLETED_ALBUMS(), { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const albumsWithAbsoluteUrl = data.albums.map((album: any) => {
            if (album.bgImage && album.bgImage.startsWith("/")) {
              return { ...album, bgImage: "https://php-laravel-docker-j6so.onrender.com" + album.bgImage };
            }
            return album;
          });
          setAlbums(albumsWithAbsoluteUrl);
        } else {
          const res = await fetch(API_ROUTES.GET_ALBUMS(), { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const albumsWithAbsoluteUrl = data.albums.map((album: any) => {
            if (album.bgImage && album.bgImage.startsWith("/")) {
              return { ...album, bgImage: "https://php-laravel-docker-j6so.onrender.com" + album.bgImage };
            }
            return album;
          });
          setAlbums(albumsWithAbsoluteUrl);
          setStats(data.stats);
        }
      } catch (e) {
        console.error('Error cargando álbumes', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [showCompletedOnly]);

  const filteredAlbums = albums.filter(a => {
    // Normaliza ambos valores
    const albumCat = (a.category || "").toLowerCase();
    const filterCat = category.toLowerCase();

    // Si filtro es "all", muestra todos
    if (filterCat === "all") return true;

    // Compara por igualdad exacta
    return albumCat === filterCat;
  }).filter(a =>
    (a.title?.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase())))
  );

  // Responsive columns: 1 on mobile, 3 on web
  const numColumns = Platform.OS === "web" && Dimensions.get("window").width > 900 ? 3 : 1;

  const handlePickAlbumImage = async (album: any) => {
    if (!token) {
      alert("No hay sesión activa. Por favor, inicia sesión.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // <-- minúsculas, así lo espera la librería
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      const uri = result.assets[0].uri as string;
      const uploadResult = await uploadAlbumBgImage(album.id, uri, token);
      if (uploadResult.success && uploadResult.bg_image) {
        // Convierte la URL a absoluta si es relativa
        let bgImageUrl = uploadResult.bg_image;
        if (bgImageUrl.startsWith("/")) {
          bgImageUrl = API_BASE + bgImageUrl;
        }
        const newAlbums = albums.map(a =>
          a.id === album.id ? { ...a, bgImage: bgImageUrl } : a
        );
        setAlbums(newAlbums);
      } else {
        alert("No se pudo guardar la imagen. Intenta de nuevo.");
      }
    }
  };

  if (loading) return <ActivityIndicator size="large" color={palette.accent2} style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={palette.pink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Álbumes</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("CrearAlbum")}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Crear Álbum</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador y filtros */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={palette.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar álbumes..."
            placeholderTextColor={palette.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterBar}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.filterBtn,
                category === cat.value && { backgroundColor: palette.pink }
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={18}
                color={category === cat.value ? "#fff" : palette.pink}
              />
              <Text style={[
                styles.filterBtnText,
                category === cat.value && { color: "#fff" }
              ]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
          {/* Toggle para mostrar solo completados */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              showCompletedOnly && { backgroundColor: palette.pink }
            ]}
            onPress={() => setShowCompletedOnly(prev => !prev)}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={showCompletedOnly ? "#fff" : palette.pink}
            />
            <Text style={[
              styles.filterBtnText,
              showCompletedOnly && { color: "#fff" }
            ]}>Completados</Text>
          </TouchableOpacity>
        </View>

        {/* Área de álbumes con fondo decorativo */}
        <ImageBackground
          source={require("../assets/Fondo-albumes-area.jpg")}
          style={{
            borderRadius: 24,
            marginHorizontal: 12,
            marginTop: 12,
            paddingVertical: 24,
            paddingHorizontal: 8,
            overflow: "hidden",
          }}
          imageStyle={{ borderRadius: 24 }}
        >
          {Array.from({ length: Math.ceil(filteredAlbums.length / 4) }).map((_, rowIdx) => (
            <AlbumRow
              key={rowIdx}
              albums={filteredAlbums.slice(rowIdx * 4, rowIdx * 4 + 4)}
              onPress={album => navigation.navigate("AlbumDetail", { album })}
              onPickImage={handlePickAlbumImage}
            />
          ))}
        </ImageBackground>

        {/* Estadísticas abajo */}
        <View style={styles.statsBox}>
          <View style={styles.statsItem}>
            <MaterialCommunityIcons name="album" size={28} color={palette.pink} />
            <Text style={styles.statsValue}>{stats.total_albums}</Text>
            <Text style={styles.statsLabel}>Álbumes totales</Text>
          </View>
          <View style={styles.statsItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color={palette.pink} />
            <Text style={styles.statsValue}>{stats.total_retos}</Text>
            <Text style={styles.statsLabel}>Retos creados</Text>
          </View>
          <View style={styles.statsItem}>
            <MaterialCommunityIcons name="image-multiple" size={28} color={palette.pink} />
            <Text style={styles.statsValue}>{stats.total_recuerdos}</Text>
            <Text style={styles.statsLabel}>Recuerdos guardados</Text>
          </View>
          <View style={styles.statsItem}>
            <MaterialCommunityIcons name="heart" size={28} color={palette.pink} />
            <Text style={styles.statsValue}>{stats.total_likes}</Text>
            <Text style={styles.statsLabel}>Likes recibidos</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// AlbumRow limpio: solo un emoji, margen extra
function AlbumRow({ albums, onPress, onPickImage }: { albums: any[]; onPress: (album: any) => void; onPickImage: (album: any) => void }) {
  return (
    <View style={{ marginBottom: 36 }}>
      {/* Cuerda */}
      <View style={{
        height: 4,
        backgroundColor: "#e5d0f7",
        borderRadius: 2,
        marginHorizontal: 24,
        marginBottom: -18,
        zIndex: 2,
      }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {albums.map((album, idx) => (
          <View key={album.id} style={{ alignItems: "center", marginHorizontal: 8 }}>
            {/* Clip */}
            <View style={{
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: "#fff", borderWidth: 2, borderColor: "#ffb300",
              marginBottom: -10, zIndex: 3,
            }} />
            {/* Postal */}
            <TouchableOpacity
              style={{
                width: 120,
                height: 80,
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 4,
                borderColor: "#ffb300",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
                marginTop: 0,
                marginBottom: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => onPress(album)}
            >
              {/* Imagen de fondo del álbum */}
              {typeof album.bgImage === "string" && album.bgImage ? (
                <Image
                  source={{ uri: album.bgImage }}
                  style={{ width: "100%", height: "100%", position: "absolute" }}
                  resizeMode="cover"
                />
              ) : (
                // Emoji solo si NO hay imagen
                <Text style={{ fontSize: 22, marginBottom: 2 }}>{getCategoryEmoji(album.category)}</Text>
              )}
              {/* Título */}
              <Text style={{
                fontSize: 14,
                color: palette.pink,
                fontWeight: "bold",
                textAlign: "center",
                backgroundColor: album.bgImage ? "rgba(255,255,255,0.7)" : "transparent",
                borderRadius: 6,
                paddingHorizontal: 2
              }}>
                {album.title}
              </Text>
              {album.completed && (
                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#2ecc71', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Completado</Text>
                </View>
              )}
              {/* Botón para elegir imagen de fondo */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 2,
                  zIndex: 5,
                }}
                onPress={() => onPickImage(album)}
              >
                <Ionicons name="camera" size={18} color={palette.pink} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Helper para solo el emoji
function getCategoryEmoji(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat === "romance" || cat === "amor") return "💖";
  if (cat === "travel" || cat === "viaje") return "✈️";
  if (cat === "family" || cat === "familia") return "👨‍👩‍👧‍👦";
  return "🌎";
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
    fontSize: 28,
    fontWeight: "bold",
    color: palette.pink,
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.pink,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: palette.text,
    fontSize: 16,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.purple,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  filterBtnText: {
    color: palette.pink,
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  albumList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  albumCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    margin: 12,
    flex: 1,
    minWidth: 320,
    maxWidth: 400,
    shadowColor: "#d726a1",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    alignSelf: "center",
  },
  coverContainer: {
    height: 140,
    backgroundColor: palette.bg1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.pink,
  },
  albumInfo: {
    padding: 14,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.pink,
    marginBottom: 2,
  },
  albumDesc: {
    color: palette.text,
    fontSize: 14,
    marginBottom: 8,
  },
  albumStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  albumStat: {
    color: palette.muted,
    fontSize: 13,
    marginLeft: 2,
  },
  albumCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  albumCodeLabel: {
    color: palette.muted,
    fontSize: 12,
    marginRight: 4,
  },
  albumCode: {
    color: palette.pink,
    fontWeight: "bold",
    fontSize: 13,
  },
  albumCreated: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  detailsBtn: {
    backgroundColor: palette.pink,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 6,
    letterSpacing: 0.5,
  },
  statsBox: {
    backgroundColor: palette.card,
    borderRadius: 16,
    margin: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#d726a1",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  statsItem: {
    alignItems: "center",
    flex: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.pink,
  },
  statsLabel: {
    color: palette.muted,
    fontSize: 12,
    textAlign: "center",
  },
});

async function uploadAlbumBgImage(albumId: number, uri: string, token: string) {
  try {
    const { SUPABASE } = await import('../config');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY);

    const ext = 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  // Some TypeScript environments for expo-file-system don't expose EncodingType.
  // Use the literal 'base64' and cast to any to satisfy the runtime API while avoiding TS errors.
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
    const fileBuffer = Buffer.from(b64, 'base64');

    const { data, error } = await supabase.storage.from(SUPABASE.BUCKET).upload(filename, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    });
    if (error) {
      console.error('Supabase upload error', error);
      Alert.alert('Error', 'No se pudo subir la imagen de fondo');
      throw new Error('Supabase upload error');
    }

    const { data: publicData } = supabase.storage.from(SUPABASE.BUCKET).getPublicUrl(data.path);
    const publicUrl = publicData?.publicUrl;

    const res = await fetch(API_ROUTES.UPDATE_ALBUM_BG_IMAGE(albumId), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bg_image_url: publicUrl }),
    });

    return res.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}