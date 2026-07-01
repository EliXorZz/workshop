export default defineNuxtPlugin(() => {
  document.documentElement.classList.add('js')
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded')
    })
  })
})
