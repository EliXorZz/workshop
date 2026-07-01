<template>
  <div class="hazard-bar" aria-hidden="true"></div>
  <header class="nav" id="nav">
    <a href="#top" class="nav__logo" aria-label="Accueil Le Bistrot de Tatina">
      <span class="logo-mark" aria-hidden="true" @click="handleLogoClick">
        <span class="rivet"></span><span class="rivet"></span>
        <span class="rivet"></span><span class="rivet"></span>
        TT
      </span>
      <span class="nav__brand">Le Bistrot<br/>de Tatina</span>
    </a>

    <nav
      class="nav__links"
      :style="menuOpen ? mobileNavStyle : undefined"
      aria-label="Navigation principale"
    >
      <a href="#histoire" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Histoire</a>
      <a href="#agenda" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Agenda</a>
      <a href="#menu" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Menu</a>
      <a href="#concert" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Concert</a>
      <a href="#assos" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Nos assos</a>
      <a href="#infos" :style="menuOpen ? mobileLinkStyle : undefined" @click="closeMenu">Infos</a>
    </nav>

    <a href="#adhesion" class="btn btn--yellow nav__cta">
      Adhérer · 15€
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
    </a>

    <button
      class="nav__burger"
      :aria-expanded="menuOpen.toString()"
      aria-label="Ouvrir le menu"
      @click="toggleMenu"
    >
      <span></span><span></span><span></span>
    </button>
  </header>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
const logoClicks = ref(0)
const { show: showToast } = useToast()

const mobileNavStyle = {
  display: 'flex',
  position: 'fixed' as const,
  top: '70px',
  left: '0',
  right: '0',
  flexDirection: 'column' as const,
  gap: '0',
  background: 'var(--black)',
  padding: '20px',
  zIndex: '49',
  borderBottom: '3px solid var(--yellow)'
}

const mobileLinkStyle = {
  padding: '14px 0',
  borderBottom: '1px dashed var(--steel-3)'
}

const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu = () => { menuOpen.value = false }

const handleLogoClick = () => {
  logoClicks.value++
  if (logoClicks.value >= 4) {
    logoClicks.value = 0
    document.body.classList.toggle('party-mode')
    showToast('🎉 Mode soirée enclenché, chut !')
  }
}
</script>
