import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/community.html").then((r) => r.text())
  return {
    name: 'Community',
    template: template,
  };
});
  