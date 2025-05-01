import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
    const template = await fetch("/components/image.html").then((r) => r.text());
    return {
        name: "Image",
        props: ["src", "width", "height", "alt", "round"],
        template: template,
        computed: {
            imgStyle() {
                return {
                    width: this.$props.width,
                    height: this.$props.height,
                    objectFit: "cover",
                    borderRadius: this.$props.round ? "50%" : "0",
                }
            }
        }
    }
});