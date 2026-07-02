export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;
  const token = sessionStorage.getItem("tatina_token");
  if (!token && to.path !== "/admin") {
    return navigateTo("/admin");
  }
});
