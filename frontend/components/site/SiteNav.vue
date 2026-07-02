<script setup lang="ts">
const menuOpen = ref(false);
const partyMode = ref(false);
const logoClicks = ref(0);
const { show } = useToast();

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenuOnLink() {
  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
    menuOpen.value = false;
  }
}

function onLogoClick() {
  logoClicks.value++;
  if (logoClicks.value >= 4) {
    logoClicks.value = 0;
    partyMode.value = !partyMode.value;
    document.body.classList.toggle("party-mode", partyMode.value);
    show("🎉 Mode soirée enclenché — chut !");
  }
}
</script>

<template>
  <header class="nav" id="nav">
    <a href="#top" class="nav__logo" aria-label="Accueil — Le Bistrot de Tatina">
      <span class="logo-mark" aria-hidden="true" @click="onLogoClick">
        <span class="rivet"></span><span class="rivet"></span>
        <span class="rivet"></span><span class="rivet"></span>
        BT
      </span>
      <span class="nav__brand">Le Bistrot<br/>de Tatina</span>
    </a>

    <nav
      class="nav__links"
      :class="{ 'is-open': menuOpen }"
      aria-label="Navigation principale"
      :style="menuOpen ? {
        display: 'flex', position: 'fixed', top: '70px', left: '0', right: '0',
        flexDirection: 'column', gap: '0', background: 'var(--black)',
        padding: '20px', zIndex: '49', borderBottom: '3px solid var(--yellow)'
      } : undefined"
    >
      <a href="#histoire" @click="closeMenuOnLink">Histoire</a>
      <a href="#agenda" @click="closeMenuOnLink">Agenda</a>
      <a href="#menu" @click="closeMenuOnLink">Menu</a>
      <a href="#concert" @click="closeMenuOnLink">Concert</a>
      <a href="#assos" @click="closeMenuOnLink">Nos dons</a>
      <a href="#infos" @click="closeMenuOnLink">Infos</a>
    </nav>

    <a href="#adhesion" class="btn btn--yellow nav__cta">
      Adhérer
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
    </a>

    <button
      class="nav__burger"
      :aria-expanded="menuOpen"
      aria-label="Ouvrir le menu"
      @click="toggleMenu"
    >
      <span></span><span></span><span></span>
    </button>
  </header>
</template>
