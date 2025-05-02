import { defineAsyncComponent } from 'vue';
import {
  fileToGraffitiObject,
  graffitiFileSchema,
} from "@graffiti-garden/wrapper-files";
import { GraffitiObjectToFile } from "@graffiti-garden/wrapper-files/vue";

import profileImage from './profileimage.js';

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
        fileUrl: "",
        graffitiFileSchema,
        loadingProfile: false,
        profileData: null,
        editing: false,
        name: "",
        description: "",
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
              let result = await this.$graffiti.patch(
                {
                  value: [
                    { "op": "replace", "path": "/profileImage", "value": this.fileUrl },
                  ]
                },
                this.profileData,
                session,
              )
              this.profileData.value.profileImage = url;
          } catch (e) {
              return alert(e);
          } finally {
              this.fileToUpload = undefined;
          }
          alert("Uploaded!");
      },
      async editProfile(session) {
        console.log(this.name);
        console.log(this.description);
        await this.$graffiti.patch(
          {
            value: [
              {"op": "replace", "path": "/name", "value": this.name },
              {"op": "replace", "path": "/description", "value": this.description },
            ]
          },
          this.profileData,
          session
        )
        this.profileData.value.name = this.name;
        this.profileData.value.description = this.description;
        this.editing = false;
      },  
    },
    async mounted() {
      let currentActor = this.$graffitiSession.value.actor;

      this.loadingProfile = true;
      const collected = [];
      const schema = {
        properties: {
          value: {
              required: ['name', 'published', 'profileImage', 'description'],
              properties: {
                  name: { type: 'string' },
                  published: { type: 'number' },
                  profileImage: { type: 'string' },
                  description: { type: 'string' },
              }
          }
        }
      };

      const stream = this.$graffiti.discover(
        ['designftw'],
        schema, 
        this.$graffitiSession.value
      );
      for await (const obj of stream) {
        collected.push(obj);
      }
      for (let i = 0; i < collected.length; i++) {
        let actor = collected[i].object.actor;
        if (actor === currentActor) {
          this.profileData = collected[i].object;
          return;
        }
      }
    },
    components: { GraffitiObjectToFile, profileImage },
  };
});
  