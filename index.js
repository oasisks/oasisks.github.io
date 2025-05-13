  import { createApp } from "vue";
  import { createRouter, createWebHistory, createWebHashHistory  } from 'vue-router';
  import { GraffitiLocal } from "@graffiti-garden/implementation-local";
  import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
  import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";


  import navbar from "./components/navbar.js";
  import community from "./components/community.js";
  import favorites from "./components/favorites.js";
  import profile from "./components/profile.js";
  import home from "./components/homepage.js";

  const routes = [
    {path: "/", component: home},
    {path: '/community', component: community},
    {path: '/community/:chatID/:groupName', component: community, props: true},
    {path: '/profile/:userName', component: profile, props: true},
  ];

  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  createApp({
    data() {
      return {
        channels: ["designftw", "designftw-2025-studio2"],
      };
    },
    methods: {
      async initProfile(session) {
        let currentActor = session.actor;
        console.log(currentActor);
        // this is the profile object we want
        const generator = window.location.origin + window.location.pathname;
        let profileObjectInit = {
          name: "",
          published: Date.now(),
          profileImage: "",
          description: "",
          generator: generator,
          describes: this.$graffitiSession.value.actor
        }
        const collected = [];
        const schema = {
          properties: {
            value: {
                required: ['name', 'published', 'profileImage', 'description', 'generator', 'describes'],
                properties: {
                    name: { type: 'string' },
                    published: { type: 'number' },
                    profileImage: { type: 'string' },
                    description: { type: 'string' },
                    generator: { type: 'string' },
                    describes: { type: 'string' },
                }
            }
          }
        };
        // this first checks for all the profiles
        const stream = this.$graffiti.discover(
          this.channels,
          schema, 
          session            
        );
      
        for await (const obj of stream) {
          collected.push(obj);
        }

        for (let i = 0; i < collected.length; i++) {
          let actor = collected[i].object.actor;
          // if we found an actor within the list of actors that is the same with the current 
          // users actor name, then this must mean this dude has a profile
          if (actor === currentActor) {
            console.log("I found something");
            return;
          }
        }

        // if we are here, then this must mean no profile, thus we set one up. 
        await this.$graffiti.put(
          {
            value: profileObjectInit,
            channels: this.channels,
          },
          session
        )
      }
    }
  })
    .use(GraffitiPlugin, {
      graffiti: new GraffitiLocal(),
      // graffiti: new GraffitiRemote(),
    })
    .use(router)
    .component("navbar", navbar)
    .mount("#app");