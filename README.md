# Catálogo SENAI — React Native + Expo + JWT

Projeto em **JavaScript** para aulas introdutórias. Interface com React Native Paper, login persistente com `expo-secure-store` e integração com a API ASP.NET Core enviada em `ExemploJwt (2).zip`.

## 1. Comece aqui

1. Extraia este ZIP e abra a pasta `ProdutosExpo` no VS Code.
2. Instale Node.js 22.13 ou superior (Node 24 LTS recomendado) e um cliente Expo compatível com **SDK 57** no celular. Computador e celular devem estar na mesma rede.
3. Configure e execute sua API conforme a seção 3.
4. Edite `services/api.js`: substitua `192.168.0.10` pelo IPv4 do computador da API.
5. No terminal da pasta do aplicativo:

```powershell
npm install
npx expo install --check
npx expo start --lan
```

No Android, leia o QR Code no Expo Go compatível. No iOS, use a câmera ou o Expo Go compatível. O computador precisa manter o terminal aberto. Para emulador Android já aberto: `npm run android`. Para simulador iOS em um Mac: `npm run ios`.

Este projeto fixa a família **SDK 57** e Paper 5 para manter uma base definida para as aulas; não usa versões alpha. Se o Expo Go instalado informar incompatibilidade, consulte https://expo.dev/go para um cliente compatível, ou atualize o projeto seguindo o guia oficial https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/ (atualize o SDK e execute `npx expo install --fix`, depois `npx expo-doctor`). No iPhone físico, versões antigas do Expo Go podem não estar disponíveis: nesse caso atualize o projeto ou use um development build compatível. Não instale apenas a versão mais recente de React Native isoladamente.

**Conta da API didática:** usuário `aluno`, senha `123456`. Esses valores foram confirmados no controller enviado pelo professor. Não são preenchidos automaticamente pelo app.

O projeto é voltado a **Android/iOS**, não ao navegador: SecureStore é usado para armazenamento nativo. Não há dependência de Expo Router nem de React Navigation.

## 2. Contratos confirmados no ZIP

Inspeção de `Controllers/AuthController.cs`, `Controllers/ProdutosController.cs`, `Models/LoginRequest.cs`, `Models/Produto.cs`, `Data/ProdutoContext.cs`, `Program.cs` e `Properties/launchSettings.json`.

| Operação | Método e rota | Corpo | Resposta |
| --- | --- | --- | --- |
| Login | `POST /api/Auth/login` | `{ "usuario": "aluno", "senha": "123456" }` | 200: `{ "token": "...", "tipo": "Bearer", "expiraEm": "data UTC" }`; 401 para credenciais inválidas |
| Listar | `GET /api/Produtos` | Sem corpo | 200: array de `{ "id": "GUID", "nome": "Caderno", "preco": 45 }` |
| Inserir | `POST /api/Produtos` | `{ "nome": "Borracha", "preco": 3.5 }` | 201: produto criado |
| Excluir | `DELETE /api/Produtos/{id}` | Sem corpo | 204 sem corpo; 404 se não encontrado |

O servidor gera o GUID. O nome é obrigatório e tem limite de 100 caracteres. O app aceita preço não negativo, até 999999999,99, com até duas casas decimais; essa é uma regra didática adicional do cliente, pois o modelo da API não impõe esse intervalo. A vírgula digitada é convertida em número antes do JSON.

**Particularidade importante:** `Listar` possui `[AllowAnonymous]`, mesmo com `[Authorize]` no controller. Portanto, listar sem token também funciona na API original. O app exige login para abrir a lista e envia Bearer no GET, mas isso não torna esse endpoint protegido no servidor. Para uma atividade posterior, remova `[AllowAnonymous]` de `Listar` e observe a mudança. POST e DELETE exigem JWT.

Não há banco de dados: produtos ficam em memória e voltam ao estado inicial quando o servidor reinicia. A chave de assinatura também é gerada em memória; reiniciar a API invalida tokens já emitidos. O JWT dura **5 minutos**, com `ClockSkew = TimeSpan.Zero`. Não existe endpoint de renovação de token nesse projeto.

## 3. API .NET acessível pelo celular

A API enviada usa .NET 10. Abra o projeto da API original e confirme o SDK com `dotnet --version`. O perfil HTTP usa porta **5127**; o HTTPS usa **7239**.

### IP e endereço de escuta

No Windows, execute `ipconfig` e localize o IPv4 do adaptador Wi-Fi/Ethernet da rede usada pelo celular. Exemplo: `192.168.0.10`. Evite IP de VPN e adaptadores virtuais.

Na pasta da API que contém `ExemploJwt.csproj`, execute:

```powershell
dotnet run --no-launch-profile --urls "http://0.0.0.0:5127"
```

`0.0.0.0` faz o servidor escutar nas interfaces de rede; não é o endereço que você digita no app. Em `services/api.js`, use o IP real:

```javascript
export const API_URL = 'http://192.168.0.10:5127';
```

Não acrescente `/api`, barra final ou rota de login nessa constante. As telas já incluem os caminhos.

No celular físico, **localhost e 127.0.0.1 apontam para o próprio celular**, não para seu computador. No emulador padrão do Android Studio, `10.0.2.2` normalmente aponta para a máquina hospedeira. No simulador iOS em um Mac, `localhost` pode alcançar o Mac. Para a aula com celular físico, prefira sempre o IPv4 da rede.

Abra `http://SEU-IP:5127/api/Produtos` no navegador do celular. Deve aparecer o JSON da lista. A API enviada não configura Swagger UI; não use `/swagger` como teste obrigatório. Se o navegador não alcançar a API, resolva a rede antes do aplicativo.

### HTTP, HTTPS e redirecionamento

O `Program.cs` original contém `app.UseHttpsRedirection()`. Para o laboratório com **HTTP em rede local**, comente temporariamente essa linha na sua cópia da API e reinicie o servidor. Isso evita que uma chamada HTTP seja redirecionada para HTTPS com um certificado não confiável no telefone. A alteração é manual e não modifica o ZIP original entregue pelo professor.

HTTP transmite credenciais e token sem criptografia: use somente no laboratório com dados fictícios. Em uma implantação real, utilize HTTPS com certificado válido para o endereço que o celular acessa.

O certificado de desenvolvimento do ASP.NET confiado no computador via `dotnet dev-certs https --trust` não fica automaticamente confiável no celular e geralmente é emitido para `localhost`, não para seu IPv4. Trocar apenas `http` por `https` no app não resolve a confiança nem o nome do certificado. Para aula inicial, HTTP local é o caminho mais curto; para HTTPS, configure certificado e nome válidos e confiáveis pelo telefone.

O comportamento de HTTP também depende do cliente nativo. No Expo Go, as permissões vêm do próprio cliente. Alterar `app.json` não altera o Expo Go instalado. Em APK/development build próprio, Android pode exigir `usesCleartextTraffic` no manifesto (por exemplo, via `expo-build-properties`, opção `android.usesCleartextTraffic: true`, e reconstrução do app). No iOS, ATS pode exigir exceção para seu endereço; `NSAllowsLocalNetworking` está configurado, mas regras por versão do iOS e acesso por IP devem ser verificadas no dispositivo. Prefira HTTPS válido para builds distribuídos. Veja https://reactnative.dev/docs/network.

### Firewall e Wi-Fi

- Autorize o processo .NET ou uma regra de entrada TCP para a porta 5127 no perfil de rede privada do Windows. Não é necessário desligar o firewall inteiro.
- A rede da escola pode bloquear conexões entre dispositivos (isolamento de clientes). Peça uma rede de laboratório que permita comunicação ou use uma rede própria autorizada.
- Verifique VPN, dados móveis e se computador e telefone estão na mesma rede.
- O Expo também precisa ser alcançável pelo celular: permita o Node/Expo na rede privada quando solicitado pelo Windows.
- `npx expo start --tunnel` pode ajudar o telefone a alcançar o Metro, mas **não cria um túnel para a API .NET**. O endereço da API continua precisando ser acessível pelo telefone.

CORS é uma restrição do navegador, não a causa habitual de falhas em `fetch` no React Native nativo. Este projeto não oferece execução web.

## 4. Arquitetura para explicar no quadro

```text
App.js                      sessão, SecureStore, tema e troca de tela
index.js                    registro do aplicativo no Expo
screens/
  LoginScreen.js            formulário e POST de login
  ProdutosScreen.js         GET, lista, diálogo e DELETE
  NovoProdutoScreen.js      formulário, validação e POST de produto
services/
  api.js                    endereço, fetch, timeout e leitura de erros
```

A navegação usa somente `useState`: sem sessão, o App exibe Login; com sessão, exibe Produtos ou NovoProduto. As informações chegam por props. Não há Redux, Context API criado pelo app, interceptadores, repositórios ou classes base. O PaperProvider é o provedor de tema exigido pela biblioteca de UI, não um gerenciador de autenticação.

As rotas, os métodos HTTP, os corpos e o cabeçalho Authorization estão visíveis nas funções das telas: `fazerLogin`, `listarProdutos`, `salvarProduto` e `excluirProduto`. O pequeno helper `requisitar` apenas executa `fetch`, trata status, timeout de 15 segundos e JSON; ele não decide navegação ou autenticação. `204` é tratado sem tentar ler JSON.

Ao salvar, a tela volta à lista. Como a lista é montada novamente, seu `useEffect` busca os produtos atualizados. O botão voltar do Android retorna do cadastro à lista; formulários não são persistidos ao sair da tela. O botão atualizar e o gesto de puxar a lista repetem o GET.

## 5. Fluxo JWT, passo a passo

1. O usuário informa usuário e senha na tela de login.
2. `LoginScreen` envia JSON ao `POST /api/Auth/login`, sem Bearer.
3. A API verifica as credenciais e assina um token com validade de cinco minutos.
4. O app recebe `token` e `expiraEm`. A senha não vai para o armazenamento.
5. `App.js` salva a sessão com `SecureStore.setItemAsync` antes de abrir o catálogo. Se falhar, o login não é concluído.
6. As telas recebem o token por props e enviam `Authorization: Bearer TOKEN` no GET, POST e DELETE.
7. A API verifica assinatura, emissor, audiência e validade nos endpoints protegidos. O app não conhece a chave de assinatura.
8. Ao abrir novamente, o App lê SecureStore e restaura somente uma sessão ainda válida pela data recebida. Isso é conveniência de interface, não prova de validade do token: a API continua sendo a autoridade.
9. Um temporizador e a volta do app ao primeiro plano verificam `expiraEm`. Uma resposta 401 em operação autenticada também encerra a sessão, inclusive se a API tiver reiniciado.
10. Logout e expiração removem a sessão persistida e retornam ao login. Se a remoção falhar, aparece uma tela para tentar limpar o armazenamento.

Um JWT é uma credencial: não deve ser exibido em logs, URLs ou mensagens ao usuário. Não é necessário decodificar o token no app nem instalar uma biblioteca JWT para esse fluxo. Não há refresh token: após expirar, o usuário entra novamente. Logout neste cliente remove a credencial local; como não há revogação no servidor, uma cópia do token ainda seria válida até expirar.

## 6. Estados e comportamento

- Login: campos obrigatórios, senha oculta com opção de mostrar, carregamento e erro 401 claro.
- Inicialização: indicador enquanto lê o armazenamento seguro.
- Lista: carregamento, erro com nova tentativa, atualização manual e lista vazia.
- Cadastro: nome obrigatório, preço validado, botão bloqueado durante envio e erro visível.
- Exclusão: diálogo com nome do produto; cancelar não envia DELETE; confirmação mostra carregamento.
- Sessão: restauração, logout e aviso de expiração.
- Rede: mensagem quando a API está indisponível e timeout de 15 segundos.
- Interface: cartões claros, destaque verde, ícones e botões com rótulos de acessibilidade; telas roláveis para teclado e aparelhos pequenos.

Não há fila offline nem repetição automática de gravações. Se a conexão cair depois de o servidor cadastrar um produto, confira a lista antes de reenviar: uma resposta perdida não prova que a gravação falhou.

## 7. Roteiro sugerido — quatro encontros de 50 minutos

| Encontro | Construção e explicação | Evidência do aluno |
| --- | --- | --- |
| 1 | Iniciar Expo, identificar componentes, props, useState e tema; testar o GET da API no telefone | Explicar por que localhost não funciona no celular |
| 2 | Formulário de login, async/await, JSON, POST e status 401; salvar a sessão com SecureStore | Entrar com senha errada e depois correta |
| 3 | FlatList, useEffect, GET com Bearer, formulário e POST de produto; conversão de preço | Criar um produto com preço 12,50 e vê-lo na lista |
| 4 | DELETE com confirmação, estados de erro, logout e expiração | Cancelar exclusão, confirmar exclusão e entrar novamente após expirar |

Primeiro percorra o caminho feliz. Depois mostre o helper e os tratamentos de falha. Peça que os alunos localizem cada rota diretamente na tela antes de alterar qualquer código.

Perguntas: Quem cria o ID? Por que o token não deve ir na URL? O GET realmente exige autenticação nessa API? O que muda ao reiniciar o servidor? Por que não guardamos a senha? Qual a diferença entre 401, 403 e falha de conexão?

## 8. Conferência antes da aula

- [ ] Executar `npm install`, `npx expo install --check` e `npx expo-doctor` na máquina de aula.
- [ ] Confirmar cliente Expo compatível com SDK 57 (ou atualizar a família inteira do SDK).
- [ ] Abrir o JSON dos produtos no navegador do celular.
- [ ] Ver erro com senha incorreta; entrar com aluno/123456.
- [ ] Criar produto, conferir preço em reais e atualizar a lista.
- [ ] Cancelar uma exclusão; depois confirmar e verificar remoção.
- [ ] Excluir todos os produtos para conferir lista vazia.
- [ ] Fechar/reabrir o app antes de cinco minutos para conferir restauração.
- [ ] Aguardar cinco minutos para conferir aviso de sessão expirada, inclusive após retornar do segundo plano.
- [ ] Reiniciar a API e tentar POST com a sessão anterior: deve voltar ao login por 401.
- [ ] Desligar a API e verificar mensagem de rede; religar e tentar novamente.
- [ ] Fazer logout e reabrir o app: deve pedir login.

## 9. Verificação da entrega e fontes

Consulte `VERIFICACAO.md` para as verificações efetivamente executadas e suas limitações. O projeto não inclui `node_modules` nem um lockfile inventado: o primeiro `npm install` com acesso à internet deve gerar `package-lock.json`. Guarde esse arquivo após validar o ambiente da turma para repetir a instalação com `npm ci`.

Versões nativas escolhidas a partir do template e do mapa oficial de compatibilidade do SDK 57:
- https://github.com/expo/expo/blob/sdk-57/templates/expo-template-blank/package.json
- https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json
- https://github.com/callstack/react-native-paper/tree/v5.14.5
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://reactnative.dev/docs/network
