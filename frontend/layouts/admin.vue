<script setup lang="ts">
useHead({ bodyAttrs: { class: "admin" } });

const { username, loadFromStorage, logout } = useAuth();

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: "▣" },
  { key: "agenda", label: "Agenda", icon: "▤" },
  { key: "menu", label: "Menu", icon: "✎" },
  { key: "horaires", label: "Horaires & infos", icon: "⏱" },
  { key: "adherents", label: "Adhérents", icon: "▰" },
  { key: "campagnes", label: "Campagnes", icon: "✉" },
  { key: "assos", label: "Assos soutenues", icon: "♡" },
  { key: "settings", label: "Réglages", icon: "⚙" },
];

const currentTab = useState<string>("admin_tab", () => "dashboard");

function goTab(key: string) {
  currentTab.value = key;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onLogout() {
  logout();
  navigateTo("/admin");
}

onMounted(() => {
  loadFromStorage();
  if (!sessionStorage.getItem("tatina_token")) {
    navigateTo("/admin");
  }
});
</script>

<template>
  <div>
    <div class="hazard-bar" aria-hidden="true"></div>

    <div class="admin-layout">
      <aside class="admin-side">
        <NuxtLink to="/" class="admin-side__brand">
          <div class="logo-mark" aria-hidden="true">
            <span class="rivet"></span><span class="rivet"></span>
            <span class="rivet"></span><span class="rivet"></span>
            BT
          </div>
          <div>
            <strong>Tatina<br/>Admin</strong>
            <small>v1.0 · 2026</small>
          </div>
        </NuxtLink>

        <nav class="admin-nav">
          <a
            v-for="t in tabs"
            :key="t.key"
            :class="{ 'is-active': currentTab === t.key }"
            @click="goTab(t.key)"
          >
            <span class="icon">{{ t.icon }}</span> {{ t.label }}
          </a>
        </nav>

        <div class="admin-side__foot">
          <span v-if="username">Connecté · <b>{{ username }}</b></span>
          <button @click="onLogout">Sortir</button>
        </div>
      </aside>

      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>
