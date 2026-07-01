<template>
  <section class="menu" id="menu">
    <div class="wrap">
      <div class="section-label section-label--light">
        <span class="num">04</span>
        <span class="tag">À L'ARDOISE</span>
      </div>

      <div class="menu__board">
        <div class="menu__board-bg" aria-hidden="true"></div>

        <div class="menu__head">
          <h2 class="chalk">Au menu, ce soir</h2>
          <p class="chalk chalk--small">Carte courte, produits du coin, prix qui causent.</p>
        </div>

        <div class="menu__cols">
          <template v-if="hasMenu">
            <div v-for="[cat, items] in menuEntries" :key="cat" class="menu__col">
              <h3 class="chalk chalk--cat">{{ cat }}</h3>
              <ul class="menu__list chalk">
                <li v-for="item in items" :key="item.label">
                  <span>{{ item.label }}</span><b>{{ item.price }}</b>
                </li>
              </ul>
            </div>
          </template>
          <template v-else>
            <div class="menu__col">
              <h3 class="chalk chalk--cat">À grignoter</h3>
              <ul class="menu__list chalk">
                <li><span>Planche chaudronnée, charcuterie & fromages d'ici</span><b>14€</b></li>
                <li><span>Houmous maison, légumes du marché, pain grillé</span><b>7€</b></li>
                <li><span>Frites maison, mayo perso</span><b>5€</b></li>
                <li><span>Olives de Nyons, amandes torréfiées</span><b>4€</b></li>
              </ul>
            </div>
            <div class="menu__col">
              <h3 class="chalk chalk--cat">Du robinet</h3>
              <ul class="menu__list chalk">
                <li><span>Pression du moment, brassée à 12 km</span><b>4€</b></li>
                <li><span>IPA locale, 5 cl à 25 cl</span><b>4→6€</b></li>
                <li><span>Verre de blanc Savoie · roussette</span><b>4€</b></li>
                <li><span>Diabolo · sirop maison sureau / menthe</span><b>3€</b></li>
              </ul>
            </div>
            <div class="menu__col">
              <h3 class="chalk chalk--cat">Sans alcool</h3>
              <ul class="menu__list chalk">
                <li><span>Citronnade pressée minute</span><b>3,5€</b></li>
                <li><span>Kombucha de la maison voisine</span><b>4€</b></li>
                <li><span>Café, torréfaction Annecy</span><b>1,5€</b></li>
                <li><span>Spritz sans alcool · romarin / pamplemousse</span><b>5€</b></li>
              </ul>
            </div>
          </template>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string
  price: string
}

const props = defineProps<{ menu: Record<string, MenuItem[]> }>()

const hasMenu = computed(() => props.menu && Object.keys(props.menu).length > 0)
const menuEntries = computed(() => Object.entries(props.menu || {}))
</script>
