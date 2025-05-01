import { defineAsyncComponent } from 'vue';
import {
  fileToGraffitiObject,
  graffitiFileSchema,
} from "@graffiti-garden/wrapper-files";
import { GraffitiObjectToFile } from "@graffiti-garden/wrapper-files/vue";


export default defineAsyncComponent(async () => {
  const template = await fetch("/components/profile.html").then((r) => r.text())
  return {
    name: 'Profile',
    template: template,
    props: ["userName"],
    data() {
      return {
        channels: ["designftw"],
        fileToUpload: undefined,
        fileURL: "",
        graffitiFileSchema
      }
    },
    methods: {
      setFileToUpload(event) {
          const target = event.target;
          if (!target.files?.length) return;
          this.fileToUpload = target.files[0];
      },
      async uploadFile(session) {
          if (!this.fileToUpload) return;
          try {
              const object = await fileToGraffitiObject(
                  this.fileToUpload,
              );
              const { url } = await this.$graffiti.put(
                  object,
                  session,
              );
              this.fileUrl = url;
          } catch (e) {
              return alert(e);
          } finally {
              this.fileToUpload = undefined;
          }
          alert("Uploaded!");
      },
    },
    components: { GraffitiObjectToFile },
    computed: {
      profileImg() {
        console.log("Generating an image");
        console.log(this.$props.userName);
      }
    }
  };
});
  