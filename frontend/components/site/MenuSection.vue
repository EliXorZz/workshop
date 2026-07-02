<script setup lang="ts">
interface MenuItem {
  id: number;
  category: string;
  label: string;
  price: string;
}

const props = defineProps<{ menu: Record<string, MenuItem[]> }>();

const categories = computed(() => Object.entries(props.menu));
</script>

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
          <h2 class="chalk">Au menu ce soir</h2>
        </div>

        <div class="menu__cols">
          <div v-for="[cat, items] in categories" :key="cat" class="menu__col">
            <h3 class="chalk chalk--cat">{{ cat }}</h3>
            <ul class="menu__list chalk">
              <li v-for="item in items" :key="item.id">
                <span>{{ item.label }}</span><b>{{ item.price }}</b>
              </li>
            </ul>
          </div>
        </div>

        <div class="menu__foot chalk chalk--small">
          ✦ La carte change selon l'humeur et les producteurs. Le menu est aussi affiché au bistrot !
        </div>
      </div>
    </div>
  </section>
</template>
