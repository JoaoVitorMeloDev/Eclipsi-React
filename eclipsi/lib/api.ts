const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredUrl ? configuredUrl.replace(/\/+$/, "") : "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (status >= 500) return "O servidor indisponivel. Tente novamente.";
  if (status >= 400) return "A requisicao foi recusada.";
  return "Nao foi possivel concluir a requisicao.";
}

export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "API_URL nao configurada. Defina EXPO_PUBLIC_API_URL no ambiente.",
      0,
    );
  }

  if (!path.startsWith("/")) {
    throw new ApiError("O caminho da API deve comecar com '/'.", 0);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.status), response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw new ApiError("A requisicao excedeu o tempo limite.", 0);
    }
    throw new ApiError("Nao foi possivel conectar ao servidor.", 0);
  } finally {
    clearTimeout(timeout);
  }
}
