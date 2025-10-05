import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_ROUTES } from "../api/routes";
import { palette } from "./VerRetosScreen";

export default function EditarRetoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { challenge } = route.params as { challenge: any };

  const [question, setQuestion] = useState(challenge.question);
  const [answer, setAnswer] = useState(challenge.answer);

  const handleSave = async () => {
    const res = await fetch(API_ROUTES.UPDATE_CHALLENGE(challenge.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (res.ok) {
      Alert.alert("Reto actualizado");
      navigation.goBack();
    } else {
      Alert.alert("Error al actualizar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Reto</Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="Pregunta"
      />
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Respuesta"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg1, justifyContent: "center", padding: 24 },
  title: { fontSize: 22, color: palette.accent2, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: palette.card, borderColor: palette.accent2, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, color: palette.text },
  button: { backgroundColor: palette.accent2, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});