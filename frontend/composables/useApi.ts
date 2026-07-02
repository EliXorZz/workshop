import type { NitroFetchRequest } from "nitropack";

/**
 * Wrapper autour de $fetch qui:
 *  - préfixe automatiquement l'URL de l'API
 *  - ajoute le Bearer token depuis sessionStorage (côté client)
 *  - déclenche une déconnexion + redirection si 401
 */
export function useApi() {
  const config = useRuntimeConfig();
  const base = config.public.apiBase;

  async function apiFetch<T = unknown>(
    path: NitroFetchRequest,
    opts: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...((opts.headers as Record<string, string>) || {}),
    };

    if (import.meta.client) {
      const token = sessionStorage.getItem("tatina_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    try {
      return await $fetch<T>(path as string, {
        baseURL: base,
        ...opts,
        headers,
      });
    } catch (err: any) {
      if (err?.response?.status === 401 && import.meta.client) {
        sessionStorage.removeItem("tatina_token");
        await navigateTo("/admin");
      }
      throw err;
    }
  }

  return { apiFetch, apiBase: base };
}
