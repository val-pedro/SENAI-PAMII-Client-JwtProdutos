# Verificação da entrega

Data: 28/10/2026.

## Executado

- Extração e leitura do ZIP `ExemploJwt (2).zip` enviado pelo professor.
- Conferência das rotas, dos modelos, dos status retornados, da expiração, da política de autenticação e das portas no código C#.
- Análise de sintaxe dos seis arquivos JavaScript/JSX com parser Babel disponível no ambiente: aprovada.
- Leitura dos dois arquivos JSON: aprovada.
- Testes do helper de rede com respostas simuladas: tratamento de 204 sem JSON, preservação de status 401, 403 e 404, leitura de mensagens de validação 400, falha de rede e cancelamento por timeout: aprovados.
- Dependências declaradas comparadas com o template oficial e o mapa de módulos nativos do Expo SDK 57. Versão 5.14.5 do React Native Paper confirmada no repositório oficial. Isso não substitui a resolução real de dependências pelo npm.

## Limitações observadas

- O registro npm não pôde ser acessado (ENOTFOUND). A tentativa de autorização de acesso foi rejeitada pela política do ambiente. Também não há pacotes suficientes em cache para instalação offline. Portanto, `npm install`, resolução de dependências, `expo install --check`, Expo Doctor e empacotamento Metro não foram concluídos.
- O executável da API incluído no ZIP iniciou e informou escuta na porta 5127. Houve aviso de acesso negado na criação das chaves de Data Protection. Uma tentativa de requisição local foi bloqueada pelas permissões de acesso a sockets; o teste de integração não pôde ser concluído. Nenhum sucesso de login ou CRUD real é afirmado nesta entrega.
- Não houve execução no Expo Go, emulador ou celular, nem inspeção visual de telas renderizadas. SecureStore, teclado, conectividade local, expiração em segundo plano e navegação precisam ser conferidos no aparelho.
- O projeto contém o cliente mobile. O servidor original não foi alterado nem incluído neste ZIP.

## Para concluir na máquina de aula

1. Ajustar o IP em `services/api.js` e executar a API como descrito no README.
2. Instalar as dependências com `npm install`.
3. Executar `npx expo install --check` e `npx expo-doctor`.
4. Iniciar `npx expo start --lan` com cliente compatível com SDK 57.
5. Executar a lista de conferência da seção 8 do README no celular.
6. Após validar a instalação, guardar o `package-lock.json` gerado para reproduzir o ambiente da turma.
