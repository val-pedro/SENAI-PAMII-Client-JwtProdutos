import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Dialog, FAB, IconButton, Portal, Text } from 'react-native-paper';
import { requisitar } from '../services/api';

export default function ProdutosScreen({ token, onNovo, onSair, onExpirar }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function listarProdutos() {
    setCarregando(true);
    setErro('');
    try {
      // GET: mesmo sendo público nessa API, enviamos o token para fins didáticos.
      const dados = await requisitar('/api/Produtos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(dados)) throw new Error('A API não retornou uma lista de produtos.');
      setProdutos(dados);
    } catch (erro) {
      if (erro.status === 401) { onExpirar(); return; }
      setErro(erro.message);
    } finally { setCarregando(false); }
  }

  // Ao voltar do cadastro, esta tela é montada novamente e atualiza a lista.
  useEffect(() => { listarProdutos(); }, [token]);

  async function excluirProduto() {
    if (!selecionado || excluindo) return;
    setExcluindo(true);
    setErro('');
    try {
      // DELETE: só chega aqui depois da confirmação no Dialog.
      await requisitar(`/api/Produtos/${encodeURIComponent(selecionado.id)}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos(atuais => atuais.filter(produto => produto.id !== selecionado.id));
      setSelecionado(null);
    } catch (erro) {
      if (erro.status === 401) { onExpirar(); return; }
      setSelecionado(null);
      setErro(erro.message);
    } finally { setExcluindo(false); }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: 'transparent' }}>
        <Appbar.Content title="Meu catálogo" />
        <Appbar.Action icon="logout" accessibilityLabel="Sair da conta" onPress={onSair} disabled={excluindo} />
      </Appbar.Header>
      <FlatList data={produtos} keyExtractor={item => item.id} contentContainerStyle={styles.lista}
        refreshing={carregando} onRefresh={excluindo ? undefined : listarProdutos}
        ListHeaderComponent={<View style={{ gap: 16, marginBottom: 20 }}>
          <Card mode="contained" style={styles.resumo}><Card.Content style={{ gap: 8 }}>
            <Text variant="labelLarge" style={{ color: '#245C4F' }}>SENAI / MOBILE LAB</Text>
            <Text variant="headlineMedium" style={{ fontWeight: '700', color: '#183D32' }}>Pequenos itens,{'\n'}grandes possibilidades.</Text>
            <Text>{produtos.length} {produtos.length === 1 ? 'produto no catálogo' : 'produtos no catálogo'}</Text>
          </Card.Content></Card>
          <View style={styles.linha}><Text variant="titleLarge">Produtos</Text>
            <Button icon="refresh" onPress={listarProdutos} disabled={carregando || excluindo}>Atualizar</Button></View>
          {!!erro && <Card style={{ backgroundColor: '#FFEDEA' }}><Card.Content style={{ gap: 8 }}>
            <Text accessibilityRole="alert">{erro}</Text>
            <Button onPress={listarProdutos} disabled={carregando}>Tentar novamente</Button>
          </Card.Content></Card>}
        </View>}
        ListEmptyComponent={carregando ? <View style={styles.vazio}><ActivityIndicator /><Text>Buscando produtos…</Text></View>
          : !erro ? <View style={styles.vazio}><Avatar.Icon icon="package-variant" size={72} />
            <Text variant="titleLarge">Seu catálogo começa aqui</Text>
            <Text style={{ textAlign: 'center' }}>Cadastre o primeiro produto para vê-lo nesta lista.</Text>
            <Button mode="outlined" onPress={onNovo}>Adicionar produto</Button></View> : null}
        renderItem={({ item }) => <Card mode="outlined" style={styles.produto}>
          <Card.Content style={styles.linha}>
            <Avatar.Icon icon="package-variant-closed" size={44} />
            <View style={{ flex: 1, gap: 5 }}><Text variant="titleMedium">{item.nome}</Text>
              <Text style={{ color: '#245C4F' }} variant="titleMedium">
                {Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text></View>
            <IconButton icon="trash-can-outline" iconColor="#A53E33" accessibilityLabel={`Excluir ${item.nome}`}
              onPress={() => setSelecionado(item)} disabled={excluindo || carregando} />
          </Card.Content>
        </Card>} />
      <FAB icon="plus" label="Novo produto" style={styles.fab} onPress={onNovo} disabled={excluindo} />
      <Portal><Dialog visible={!!selecionado} dismissable={!excluindo} onDismiss={() => setSelecionado(null)}>
        <Dialog.Title>Excluir produto?</Dialog.Title>
        <Dialog.Content><Text>“{selecionado?.nome}” será removido do catálogo. Esta ação não pode ser desfeita.</Text></Dialog.Content>
        <Dialog.Actions>
          <Button disabled={excluindo} onPress={() => setSelecionado(null)}>Cancelar</Button>
          <Button textColor="#A53E33" loading={excluindo} disabled={excluindo} onPress={excluirProduto}>Excluir</Button>
        </Dialog.Actions>
      </Dialog></Portal>
    </View>
  );
}
const styles = StyleSheet.create({
  lista: { padding: 20, paddingBottom: 110, maxWidth: 700, width: '100%', alignSelf: 'center', flexGrow: 1 },
  resumo: { backgroundColor: '#DCEEE3', borderRadius: 24 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  produto: { marginBottom: 12, borderColor: '#DCE4DD', backgroundColor: '#FFFFFF', borderRadius: 18 },
  vazio: { alignItems: 'center', paddingVertical: 32, gap: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#DCEEE3' },
});
