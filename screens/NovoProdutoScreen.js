import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { requisitar } from "../services/api";

export default function NovoProdutoScreen({ token, onVoltar, onExpirar }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvarProduto() {
    if (salvando) return;
    // Aceita 12,50 ou 12.50; não aceita separadores de milhar nem notação científica.
    const texto = preco.trim();
    const valor = Number(texto.replace(",", "."));
    if (!nome.trim() || nome.trim().length > 100) {
      setErro("Informe um nome com até 100 caracteres.");
      return;
    }
    if (
      !/^\d+([.,]\d{1,2})?$/.test(texto) ||
      !Number.isFinite(valor) ||
      valor > 999999999.99
    ) {
      setErro(
        "Informe um preço de 0 a 999999999,99, com até duas casas decimais e sem separador de milhar.",
      );
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      // POST: enviamos nome e preco. O servidor cria o GUID.
      await requisitar("/api/Produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nome.trim(), preco: valor }),
      });
      onVoltar();
    } catch (erro) {
      if (erro.status === 401) {
        onExpirar();
        return;
      }
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Appbar.Header
        statusBarHeight={0}
        style={{ backgroundColor: "transparent" }}
      >
        <Appbar.BackAction
          onPress={onVoltar}
          disabled={salvando}
          accessibilityLabel="Voltar para produtos"
        />
        <Appbar.Content title="Novo produto" />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          gap: 20,
          maxWidth: 560,
          width: "100%",
          alignSelf: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Avatar.Icon icon="package-variant-plus" size={64} />
        <Text
          variant="headlineMedium"
          style={{ fontWeight: "700", color: "#183D32" }}
        >
          Mais um item.{"\n"}Mais possibilidades.
        </Text>
        <Text variant="bodyLarge">
          Preencha os dados e adicione um produto ao seu catálogo.
        </Text>
        <Card
          mode="contained"
          style={{ backgroundColor: "#FFFFFF", borderRadius: 24 }}
        >
          <Card.Content style={{ gap: 16 }}>
            <TextInput
              label="Nome do produto"
              mode="outlined"
              value={nome}
              onChangeText={setNome}
              maxLength={100}
              editable={!salvando}
              autoCapitalize="sentences"
            />
            <TextInput
              label="Preço (R$)"
              placeholder="Ex.: 29,90"
              mode="outlined"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
              editable={!salvando}
            />
            <Text variant="bodySmall">
              Use vírgula ou ponto para os centavos, sem separador de milhar.
            </Text>
            {!!erro && (
              <HelperText type="error" accessibilityRole="alert">
                {erro}
              </HelperText>
            )}
            <Button
              mode="contained"
              icon="check"
              loading={salvando}
              disabled={salvando}
              contentStyle={{ padding: 7 }}
              onPress={salvarProduto}
            >
              Salvar produto
            </Button>
            <Button disabled={salvando} onPress={onVoltar}>
              Cancelar
            </Button>
          </Card.Content>
        </Card>
        <View
          style={{ padding: 16, backgroundColor: "#E4EEE8", borderRadius: 16 }}
        >
          <Text variant="bodySmall">
            O identificador do produto é criado automaticamente pela API.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
