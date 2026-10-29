// Troque pelo IPv4 do computador que executa a API (ipconfig no Windows).
// Não inclua /api ao final. Este endereço é um exemplo, não o IP detectado.
// export const API_URL = 'http://192.168.0.10:5127';
export const API_URL = 'http://10.136.184.18:5127';

// As chamadas e os headers ficam nas telas. Aqui só repetimos menos código
// para timeout, leitura da resposta e mensagens de erro.
export async function requisitar(caminho, opcoes = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, signal: controller.signal });
    if (!resposta.ok) {
      const texto = await resposta.text();
      let mensagem = `Não foi possível concluir a operação (HTTP ${resposta.status}).`;
      if (resposta.status === 403) mensagem = 'Seu usuário não tem permissão para esta operação.';
      if (resposta.status === 404) mensagem = 'Produto não encontrado. Atualize a lista.';
      if (resposta.status === 400) {
        mensagem = 'Confira os dados informados.';
        try {
          const problema = JSON.parse(texto);
          if (problema.errors) mensagem = Object.values(problema.errors).flat().join('\n');
        } catch { /* A API também pode responder sem JSON. */ }
      }
      const erro = new Error(mensagem);
      erro.status = resposta.status;
      throw erro;
    }
    // DELETE responde 204 e não tem JSON para converter.
    if (resposta.status === 204) return null;
    return await resposta.json();
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('A API demorou para responder. Tente novamente.');
    if (erro instanceof SyntaxError) throw new Error('A API retornou uma resposta inválida. Confira o endereço e tente novamente.');
    if (erro instanceof TypeError) throw new Error('Sem conexão com a API. Confira o IP, o Wi-Fi e se o servidor está ligado.');
    throw erro;
  } finally { clearTimeout(timeout); }
}

