import React, { useEffect, useState } from "react";
import { AppState, BackHandler, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  MD3LightTheme,
  PaperProvider,
  Text,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "./screens/LoginScreen";
import ProdutosScreen from "./screens/ProdutosScreen";
import NovoProdutoScreen from "./screens/NovoProdutoScreen";

const CHAVE_SESSAO = "sessao-produtos";
const tema = {
  ...MD3LightTheme,
  roundness: 5,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#245C4F",
    secondary: "#53675E",
    background: "#F5F7F4",
    surface: "#FFFFFF",
    primaryContainer: "#DCEEE3",
    onPrimaryContainer: "#183D32",
  },
};

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [tela, setTela] = useState("produtos");
  const [iniciando, setIniciando] = useState(true);
  const [aviso, setAviso] = useState("");
  const [erroArmazenamento, setErroArmazenamento] = useState("");

  async function restaurarSessao() {
    setIniciando(true);
    setErroArmazenamento("");
    try {
      const texto = await SecureStore.getItemAsync(CHAVE_SESSAO);
      if (texto) {
        let salva;
        try {
          salva = JSON.parse(texto);
        } catch {
          salva = null;
        }
        if (
          typeof salva?.token === "string" &&
          salva.token &&
          Date.parse(salva.expiraEm) > Date.now()
        )
          setSessao(salva);
        else {
          await SecureStore.deleteItemAsync(CHAVE_SESSAO);
          setAviso("Sua sessão expirou. Entre novamente.");
        }
      }
    } catch {
      setErroArmazenamento(
        "Não foi possível acessar o armazenamento seguro. Tente novamente.",
      );
    } finally {
      setIniciando(false);
    }
  }
  useEffect(() => {
    restaurarSessao();
  }, []);

  async function entrar(novaSessao) {
    // Só abrimos o catálogo depois de salvar com sucesso. Nunca salvamos a senha.
    await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(novaSessao));
    setAviso("");
    setTela("produtos");
    setSessao(novaSessao);
  }

  async function sair(expirada = false) {
    setSessao(null);
    setTela("produtos");
    setAviso(
      expirada
        ? "Sua sessão expirou. Entre novamente."
        : "Você saiu da sua conta.",
    );
    try {
      await SecureStore.deleteItemAsync(CHAVE_SESSAO);
    } catch {
      setErroArmazenamento(
        "A sessão foi fechada, mas não foi possível removê-la do dispositivo. Tente limpar novamente.",
      );
    }
  }

  async function limparSessao() {
    try {
      await SecureStore.deleteItemAsync(CHAVE_SESSAO);
      setSessao(null);
      setErroArmazenamento("");
    } catch {
      setErroArmazenamento(
        "Não foi possível limpar o armazenamento seguro. Tente novamente.",
      );
    }
  }

  useEffect(() => {
    if (!sessao) return;
    const verificar = () => {
      if (Date.parse(sessao.expiraEm) <= Date.now()) sair(true);
    };
    const timer = setTimeout(
      verificar,
      Math.max(0, Date.parse(sessao.expiraEm) - Date.now()),
    );
    const listener = AppState.addEventListener("change", (estado) => {
      if (estado === "active") verificar();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [sessao]);

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sessao && tela === "novo") {
        setTela("produtos");
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [sessao, tela]);

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={tema}
        settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}
      >
        <StatusBar style="dark" />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: tema.colors.background }}
        >
          {iniciando ? (
            <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
              <ActivityIndicator size="large" />
              <Text style={{ textAlign: "center" }}>Abrindo seu catálogo…</Text>
            </View>
          ) : erroArmazenamento ? (
            <View
              style={{
                padding: 28,
                flex: 1,
                justifyContent: "center",
                gap: 20,
              }}
            >
              <Text variant="headlineSmall">Armazenamento seguro</Text>
              <Text accessibilityRole="alert">{erroArmazenamento}</Text>
              <Button mode="contained" onPress={limparSessao}>
                Limpar sessão e continuar
              </Button>
              <Button onPress={restaurarSessao}>
                Tentar leitura novamente
              </Button>
            </View>
          ) : !sessao ? (
            <LoginScreen onEntrar={entrar} aviso={aviso} />
          ) : tela === "novo" ? (
            <NovoProdutoScreen
              token={sessao.token}
              onVoltar={() => setTela("produtos")}
              onExpirar={() => sair(true)}
            />
          ) : (
            <ProdutosScreen
              token={sessao.token}
              onNovo={() => setTela("novo")}
              onSair={() => sair()}
              onExpirar={() => sair(true)}
            />
          )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
