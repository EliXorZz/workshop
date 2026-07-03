<script setup lang="ts">
interface GalleryImage {
  id: number;
  file_url: string;
}

const props = defineProps<{ images: GalleryImage[]; apiBase: string }>();

const fileBase = computed(() => props.apiBase.replace("/api", ""));

const track = ref<HTMLElement | null>(null);
const current = ref(0);
const lightbox = ref<number | null>(null);

const total = computed(() => props.images.length);

function scrollTo(index: number) {
  if (!track.value) return;
  current.value = Math.max(0, Math.min(index, total.value - 1));
  const slide = track.value.children[current.value] as HTMLElement;
  if (slide) slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
}

function prev() { scrollTo(current.value - 1); }
function next() { scrollTo(current.value + 1); }

function openLightbox(index: number) { lightbox.value = index; }
function closeLightbox() { lightbox.value = null; }
function lightboxPrev() { if (lightbox.value !== null) lightbox.value = (lightbox.value - 1 + total.value) % total.value; }
function lightboxNext() { if (lightbox.value !== null) lightbox.value = (lightbox.value + 1) % total.value; }

function onKeydown(e: KeyboardEvent) {
  if (lightbox.value === null) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxPrev();
  if (e.key === "ArrowRight") lightboxNext();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

function onScroll() {
  if (!track.value) return;
  const w = (track.value.children[0] as HTMLElement)?.offsetWidth || 1;
  current.value = Math.round(track.value.scrollLeft / w);
}
</script>

<template>
  <section class="gallery-section" id="galerie">
    <div class="wrap">
      <div class="section-label">
        <span class="num">—</span>
        <span class="tag">GALERIE</span>
      </div>
      <h2 class="h-display reveal">Le lieu, <span class="hl">en images.</span></h2>
    </div>

    <div class="carousel">
      <div class="carousel__track" ref="track" @scroll.passive="onScroll">
        <div
          v-for="(img, i) in images"
          :key="img.id"
          class="carousel__slide"
          @click="openLightbox(i)"
        >
          <img
            :src="`${fileBase}${img.file_url}`"
            :alt="`Photo ${i + 1}`"
            loading="lazy"
          />
        </div>
      </div>

      <button v-if="total > 1" class="carousel__btn carousel__btn--prev" aria-label="Précédent" @click="prev">
        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
      </button>
      <button v-if="total > 1" class="carousel__btn carousel__btn--next" aria-label="Suivant" @click="next">
        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
      </button>

      <div v-if="total > 1" class="carousel__dots">
        <button
          v-for="(_, i) in images"
          :key="i"
          :class="['carousel__dot', { 'is-active': i === current }]"
          :aria-label="`Image ${i + 1}`"
          @click="scrollTo(i)"
        />
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightbox !== null" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox__close" aria-label="Fermer" @click="closeLightbox">✕</button>

        <button v-if="total > 1" class="lightbox__nav lightbox__nav--prev" aria-label="Précédent" @click="lightboxPrev">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
        </button>

        <div class="lightbox__img-wrap">
          <img
            :src="`${fileBase}${images[lightbox].file_url}`"
            :alt="`Photo ${lightbox + 1}`"
          />
        </div>

        <button v-if="total > 1" class="lightbox__nav lightbox__nav--next" aria-label="Suivant" @click="lightboxNext">
          <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
        </button>

        <div class="lightbox__counter">{{ lightbox + 1 }} / {{ total }}</div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery-section {
  padding: 5rem 0 0;
  background: var(--black);
  overflow: hidden;
}

.gallery-section .wrap { padding-bottom: 2.5rem; }

/* ── Carousel ── */
.carousel { position: relative; }

.carousel__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  gap: 4px;
}
.carousel__track::-webkit-scrollbar { display: none; }

.carousel__slide {
  flex: 0 0 70vw;
  max-width: 900px;
  scroll-snap-align: start;
  position: relative;
  cursor: zoom-in;
  overflow: hidden;
  background: #111;
}
@media (max-width: 640px) {
  .carousel__slide { flex: 0 0 90vw; }
}

.carousel__slide img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  display: block;
  transition: transform .4s ease;
}
@media (max-width: 640px) {
  .carousel__slide img { height: 280px; }
}

.carousel__slide:hover img { transform: scale(1.02); }

.carousel__caption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: .6rem 1rem;
  background: linear-gradient(transparent, rgba(0,0,0,.7));
  font-size: .85rem;
  color: #fff;
}

.carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,.6);
  border: 1px solid rgba(255,255,255,.2);
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  z-index: 2;
}
.carousel__btn:hover { background: rgba(0,0,0,.9); }
.carousel__btn--prev { left: 1rem; }
.carousel__btn--next { right: 1rem; }
.carousel__btn svg { width: 20px; height: 20px; }

.carousel__dots {
  display: flex;
  justify-content: center;
  gap: .4rem;
  padding: 1.25rem 0;
}
.carousel__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,.25);
  border: none;
  cursor: pointer;
  transition: background .2s, transform .2s;
}
.carousel__dot.is-active {
  background: var(--yellow);
  transform: scale(1.3);
}

/* ── Lightbox ── */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.92);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.lightbox__close {
  position: absolute;
  top: 1.25rem; right: 1.25rem;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lightbox__close:hover { background: rgba(255,255,255,.2); }

.lightbox__nav {
  flex: 0 0 auto;
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lightbox__nav:hover { background: rgba(255,255,255,.2); }
.lightbox__nav svg { width: 22px; height: 22px; }

.lightbox__img-wrap {
  flex: 0 1 auto;
  max-width: min(90vw, 1100px);
  text-align: center;
}
.lightbox__img-wrap img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.lightbox__caption {
  color: rgba(255,255,255,.7);
  font-size: .875rem;
  margin-top: .75rem;
}

.lightbox__counter {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: .8rem;
  color: rgba(255,255,255,.4);
  letter-spacing: .08em;
}
</style>
