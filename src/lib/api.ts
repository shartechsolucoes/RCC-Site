const CONFIGURED = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/**
 * Base da API resolvida em tempo de execução.
 *
 * No servidor devolve o valor configurado — é o próprio processo Next falando
 * com a API vizinha. No navegador, se o valor apontar para localhost e a página
 * tiver sido servida por outro host (acesso pela rede), reaproveitamos esse
 * host: senão "localhost" passaria a ser o aparelho do visitante. Assim vale em
 * localhost e na rede, sem fixar um IP que o DHCP troca.
 */
export function apiUrl() {
  if (typeof window === "undefined") return CONFIGURED;

  try {
    const configured = new URL(CONFIGURED);
    const isLoopback = configured.hostname === "localhost" || configured.hostname === "127.0.0.1";

    if (isLoopback && window.location.hostname !== configured.hostname) {
      configured.hostname = window.location.hostname;
      return configured.origin;
    }
  } catch {
    // NEXT_PUBLIC_API_URL malformada: usa o valor como veio.
  }

  return CONFIGURED;
}

/**
 * GET numa rota da API, para uso em Server Components.
 *
 * Devolve `null` quando a API falha ou responde erro, deixando a página decidir
 * entre estado vazio e 404. A falha vai para o log do servidor — no navegador
 * ela seria invisível.
 *
 * `cache: "no-store"` é redundante no Next 16, onde `fetch` já não cacheia por
 * padrão, mas fica explícito porque estes dados precisam ser sempre atuais.
 */
export async function getFromApi<T>(path: string): Promise<T | null> {
  const url = `${apiUrl()}${path}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(`[api] ${response.status} ao chamar ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (cause) {
    console.error(`[api] falha ao chamar ${url}:`, cause);
    return null;
  }
}
