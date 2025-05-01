import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/profile.html").then((r) => r.text())
  return {
    name: 'Profile',
    template: template,
  };
});
  