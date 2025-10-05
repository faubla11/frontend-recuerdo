import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CreateAlbumScreen from "./src/screens/CreateAlbumScreen"; // Importa la pantalla
import AlbumDetailScreen from "./src/screens/AlbumDetailScreen"; // Importa la pantalla de detalles del álbum
import { UserProvider, useUser } from "./src/contexts/UserContext";
import AddChallengeScreen from "./src/screens/AddChallengeScreen"; // Importa la pantalla de añadir desafío
import AddMemoryScreen from "./src/screens/AddMemoryScreen"; // Importa la pantalla
import VerRetosScreen from "./src/screens/VerRetosScreen"; // Importa la pantalla de ver retos
import EditarRetoScreen from "./src/screens/EditarRetoScreen"; // Importa la pantalla de editar reto
import VerRetoScreen from "./src/screens/VerRetoScreen"; // Importa la pantalla de ver reto
import MisAlbumesScreen from "./src/screens/MisAlbumesScreen"; // Importa la pantalla de mis álbumes
import IngresarCodigoScreen from "./src/screens/IngresarCodigoScreen";
import RetosAventuraScreen from "./src/screens/RetosAventuraScreen";
import AlbumCompletoScreen from "./src/screens/AlbumCompletoScreen";


export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  CrearAlbum: undefined;
  AlbumDetail: { album: any };
  AddChallenge: { album: {
    id: number;
    title: string;
    description?: string;
    category: string;
    code: string;
    share_url: string;
    retos_count?: number;
    veces_resuelto?: number;
  }};
  AddMemory: { challenge: { id: number; question: string } };
  VerRetos: { album: { id: number; title: string; description?: string; category: string; code: string; share_url: string; retos_count?: number; veces_resuelto?: number; } }; // <-- AGREGA ESTA LÍNEA
  VerReto: { challengeId: number };
  EditarReto: { challenge: any };
  MisAlbumes: undefined;
  IngresarCodigo: undefined; // <-- AGREGA ESTO
  RetosAventura: { album: any }; // <-- AGREGA ESTO
  AlbumCompleto: { album: any }; // <-- AGREGA ESTO
};


const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, loading } = useUser();

  if (loading) return null; // Puedes poner un splash o loader aquí

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CrearAlbum" component={CreateAlbumScreen} />
          <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} /> 
          <Stack.Screen name="AddChallenge" component={AddChallengeScreen} /> 
          <Stack.Screen name="AddMemory" component={AddMemoryScreen} /> 
          <Stack.Screen name="VerRetos" component={VerRetosScreen} /> 
          <Stack.Screen name="EditarReto" component={EditarRetoScreen} />
          <Stack.Screen name="VerReto" component={VerRetoScreen} />
          <Stack.Screen name="MisAlbumes" component={MisAlbumesScreen} />
          <Stack.Screen name="IngresarCodigo" component={IngresarCodigoScreen} />
          <Stack.Screen name="RetosAventura" component={RetosAventuraScreen} />
          <Stack.Screen name="AlbumCompleto" component={AlbumCompletoScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}


export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}