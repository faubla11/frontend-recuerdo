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
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ROUTES } from "../api/routes";
import { useUser } from "../contexts/UserContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // Ajusta la ruta si tu tipo está en otro archivo
import { Calendar } from "react-native-calendars";

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
  purple: "#e6e6fa",
  green: "#4caf50",
};

const challengeSchema = z.object({
  question: z.string().min(5, "La pregunta es obligatoria"),
  answer_type: z.enum(["text", "date", "exact"]),
  answer: z.string().min(1, "La respuesta es obligatoria"),
});

type ChallengeForm = z.infer<typeof challengeSchema>;

const answerTypes = [
  { label: "Texto libre", value: "text", help: 'Respuesta en texto (ej: "Playa Montañita")' },
  { label: "Fecha", value: "date", help: 'Respuesta con fecha específica (ej: "14/02/2021")' },
  { label: "Frase exacta", value: "exact", help: "Frase que debe coincidir exactamente" },
];

export default function AddChallengeScreen() {
  const { token } = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { width } = useWindowDimensions();

  // Recibe el álbum por params
  const { album } = route.params as { album: { id: number; title: string } };

  const [selectedType, setSelectedType] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);

  const form = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: { question: "", answer_type: "" as any, answer: "" },
  });

  const onSubmit = async (data: ChallengeForm) => {
    try {
      const response = await fetch(API_ROUTES.ADD_CHALLENGE(album.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        navigation.replace("AddMemory", { challenge: result.challenge });
      } else {
        Alert.alert("Error", result.message || "No se pudo crear el reto");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor");
    }
  };

  // Responsivo: ancho de la tarjeta
  const cardWidth = width > 700 ? 500 : width > 500 ? 400 : "95%";

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
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={palette.accent2} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Recuerdos Ocultos</Text>
              <View style={{ width: 22 }} />
            </View>

            <Text style={styles.title}>Crear Reto</Text>
            <Text style={styles.subtitle}>
              Para el álbum: <Text style={{ color: palette.accent }}>{album.title}</Text>
            </Text>

            {/* Pregunta */}
            <Text style={styles.label}>Pregunta del reto</Text>
            <Controller
              control={form.control}
              name="question"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                    placeholder='Ej: ¿Dónde nos conocimos?, ¿Cuál es nuestra canción favorita?, ¿En qué fecha fue nuestro primer beso?'
                    placeholderTextColor={palette.muted}
                    value={value}
                    onChangeText={onChange}
                    multiline
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />

            {/* Tipo de respuesta */}
            <Text style={styles.label}>Tipo de respuesta</Text>
            <Controller
              control={form.control}
              name="answer_type"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TouchableOpacity
                    style={styles.select}
                    onPress={() => setSelectedType(selectedType ? "" : "open")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectText}>
                      {answerTypes.find((t) => t.value === value)?.label || "Selecciona el tipo de respuesta"}
                    </Text>
                    <Ionicons
                      name={selectedType ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={palette.accent2}
                    />
                  </TouchableOpacity>
                  {selectedType === "open" && (
                    <View style={styles.dropdown}>
                      {answerTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            onChange(type.value);
                            setSelectedType("");
                          }}
                        >
                          <Text style={styles.selectText}>{type.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {error && <Text style={styles.error}>{error.message}</Text>}
                  {value && (
                    <Text style={styles.helpText}>
                      {answerTypes.find((t) => t.value === value)?.help}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Respuesta correcta */}
            <Text style={styles.label}>Respuesta correcta</Text>
            <Controller
              control={form.control}
              name="answer"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  {form.watch("answer_type") === "date" ? (
                    <>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowCalendar(true)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="calendar" size={22} color={palette.accent2} style={{ marginRight: 8 }} />
                        <Text style={{
                          color: value ? palette.text : palette.muted,
                          fontSize: 16,
                          flex: 1,
                        }}>
                          {value ? value : "Selecciona la fecha"}
                        </Text>
                      </TouchableOpacity>
                      {showCalendar && (
                        <View style={styles.calendarModal}>
                          <Calendar
                            onDayPress={day => {
                              onChange(day.dateString); // YYYY-MM-DD
                              setShowCalendar(false);
                            }}
                            markedDates={value ? { [value]: { selected: true, selectedColor: palette.accent2 } } : {}}
                            style={styles.calendar}
                            theme={{
                              backgroundColor: palette.card,
                              calendarBackground: palette.card,
                              textSectionTitleColor: palette.accent2,
                              selectedDayBackgroundColor: palette.accent2,
                              selectedDayTextColor: "#fff",
                              todayTextColor: palette.accent,
                              dayTextColor: palette.text,
                              textDisabledColor: palette.muted,
                              arrowColor: palette.accent2,
                              monthTextColor: palette.accent2,
                              indicatorColor: palette.accent2,
                              textMonthFontWeight: "bold",
                              textDayFontWeight: "600",
                              textDayHeaderFontWeight: "700",
                            }}
                          />
                        </View>
                      )}
                    </>
                  ) : (
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa la respuesta correcta"
                      placeholderTextColor={palette.muted}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                  {error && <Text style={styles.error}>{error.message}</Text>}
                  <Text style={styles.helpText}>
                    Esta será la respuesta que debe escribir correctamente para desbloquear el recuerdo
                  </Text>
                </>
              )}
            />

            {/* Botón guardar */}
            <TouchableOpacity
              style={styles.button}
              onPress={form.handleSubmit(onSubmit)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[palette.accent, palette.accent2]}
                style={styles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Guardar reto</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Pista */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 ¿Qué sigue?</Text>
              <Text style={styles.infoText}>
                Una vez creado el reto, podrás añadir fotos, videos y notas que se desbloquearán cuando alguien responda correctamente la pregunta.
              </Text>
            </View>
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
    padding: 24,
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: palette.accent2,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: palette.accent2,
    textAlign: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: palette.text,
    marginBottom: 18,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.accent2,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderColor: palette.accent2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: palette.text,
    marginBottom: 12,
    backgroundColor: palette.card,
    flexDirection: "row",
    alignItems: "center",
  },
  select: {
    height: 48,
    borderColor: palette.accent2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: palette.card,
  },
  selectText: {
    fontSize: 16,
    color: palette.text,
  },
  dropdown: {
    backgroundColor: palette.card,
    borderRadius: 8,
    borderColor: palette.accent2,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  error: {
    color: palette.error,
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 8,
  },
  gradientBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  calendarModal: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
    width: 340,
    zIndex: 10,
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
  },
  helpText: {
    color: palette.muted,
    fontSize: 13,
    marginBottom: 8,
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
    color: palette.accent2,
    marginBottom: 2,
    fontSize: 16,
  },
  infoText: {
    color: palette.text,
    fontSize: 14,
  },
});
