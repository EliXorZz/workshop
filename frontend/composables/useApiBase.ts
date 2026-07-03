/**
 * Retourne l'URL de base de l'API à utiliser dans le contexte courant.
 * Côté serveur (SSR), on privilégie `apiBaseInternal` si défini
 * (utile en Docker: le service `api` n'est joignable qu'en interne).
 * Côté client, on utilise l'URL publique.
 */
export function useApiBase() {
  const config = useRuntimeConfig();
  if (import.meta.server && config.apiBaseInternal) {
    return config.apiBaseInternal as string;
  }
  return config.public.apiBase as string;
}
