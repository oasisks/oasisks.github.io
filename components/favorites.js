import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/favorites.html").then((r) => r.text())
  return {
    name: 'FavoritesPage',
    template: template,
  };
});
  