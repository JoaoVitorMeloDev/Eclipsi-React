export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://seu-backend.com";

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  return res.json();
}
