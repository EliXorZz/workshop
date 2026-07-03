export function useAuth() {
  const token = useState<string | null>("tatina_token", () => null);
  const username = useState<string | null>("tatina_username", () => null);

  function loadFromStorage() {
    if (!import.meta.client) return;
    const t = sessionStorage.getItem("tatina_token");
    token.value = t;
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split(".")[1]));
        username.value = payload.username || null;
      } catch {
        username.value = null;
      }
    }
  }

  function login(newToken: string) {
    if (import.meta.client) sessionStorage.setItem("tatina_token", newToken);
    token.value = newToken;
    try {
      const payload = JSON.parse(atob(newToken.split(".")[1]));
      username.value = payload.username || null;
    } catch {
      username.value = null;
    }
  }

  function logout() {
    if (import.meta.client) sessionStorage.removeItem("tatina_token");
    token.value = null;
    username.value = null;
  }

  return { token, username, loadFromStorage, login, logout };
}
