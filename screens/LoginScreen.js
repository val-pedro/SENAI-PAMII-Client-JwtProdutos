import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { requisitar } from "../services/api";

export default function LoginScreen({ onEntrar, aviso }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function fazerLogin() {
    if (carregando) return;
    if (!usuario.trim() || !senha) {
      setErro("Informe seu usuário e sua senha.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      // 1. Enviamos as credenciais. Esta chamada não usa Bearer.
      const dados = await requisitar("/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuario.trim(), senha }),
      });
      if (
        !dados.token ||
        !Number.isFinite(Date.parse(dados.expiraEm)) ||
        Date.parse(dados.expiraEm) <= Date.now()
      ) {
        throw new Error(
          "A API retornou uma sessão inválida. Confira o contrato de login.",
        );
      }
      // 2. App.js salva o token no SecureStore e abre a lista.
      try {
        await onEntrar({ token: dados.token, expiraEm: dados.expiraEm });
      } catch {
        throw new Error(
          "Não foi possível salvar a sessão no armazenamento seguro. Tente novamente.",
        );
      }
      setSenha("");
    } catch (erro) {
      setErro(
        erro.status === 401 ? "Usuário ou senha incorretos." : erro.message,
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.marca}>
          <Avatar.Icon size={60} icon="package-variant-closed" />
          <Text variant="labelLarge" style={styles.etiqueta}>
            SENAI / MOBILE LAB
          </Text>
        </View>
        <Text variant="displaySmall" style={styles.titulo}>
          Seu catálogo.{"\n"}Na palma da mão.
        </Text>
        <Text variant="bodyLarge" style={styles.descricao}>
          Organize seus produtos com uma experiência simples e conectada.
        </Text>
        <Card mode="contained" style={styles.card}>
          <Card.Content style={{ gap: 14 }}>
            <Text variant="headlineSmall">Boas-vindas</Text>
            <Text>Entre com sua conta para começar.</Text>
            {!!aviso && (
              <Text accessibilityRole="alert" style={styles.aviso}>
                {aviso}
              </Text>
            )}
            <TextInput
              label="Usuário"
              mode="outlined"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
              autoComplete="username"
            />
            <TextInput
              label="Senha"
              mode="outlined"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!visivel}
              editable={!carregando}
              autoComplete="current-password"
              onSubmitEditing={fazerLogin}
              right={
                <TextInput.Icon
                  icon={visivel ? "eye-off" : "eye"}
                  accessibilityLabel={
                    visivel ? "Ocultar senha" : "Mostrar senha"
                  }
                  onPress={() => setVisivel(!visivel)}
                />
              }
            />
            {!!erro && (
              <HelperText type="error" accessibilityRole="alert">
                {erro}
              </HelperText>
            )}
            <Button
              mode="contained"
              icon="arrow-right"
              contentStyle={{ padding: 7 }}
              onPress={fazerLogin}
              loading={carregando}
              disabled={carregando}
            >
              Entrar no catálogo
            </Button>
          </Card.Content>
        </Card>
        <Text variant="bodySmall" style={styles.rodape}>
          Uma aula de cada vez. Um app de verdade.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 20,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  marca: { flexDirection: "row", alignItems: "center", gap: 16 },
  etiqueta: { color: "#245C4F", letterSpacing: 1.5 },
  titulo: { fontWeight: "700", color: "#183D32", marginTop: 12 },
  descricao: { color: "#53675E", lineHeight: 25 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24 },
  aviso: { backgroundColor: "#E4EEE8", padding: 12, borderRadius: 12 },
  rodape: { textAlign: "center", color: "#53675E" },
});
