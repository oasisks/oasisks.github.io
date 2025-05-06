import { createApp } from "vue";
import { createRouter, createWebHistory, createWebHashHistory  } from 'vue-router';
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";


import navbar from "./components/navbar.js";
import community from "./components/community.js";
import favorites from "./components/favorites.js";
import profile from "./components/profile.js";

const routes = [
  {path: '/community', component: community},
  {path: '/community/:chatID/:groupName', component: community, props: true},
  {path: '/favorites', component: favorites},
  {path: '/profile/:userName', component: profile, props: true},
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

createApp({
  data() {
    return {
      channels: ["designftw"],
    };
  },
  methods: {
    async initProfile(session) {
      let currentActor = session.actor;
      console.log(currentActor);
      // this is the profile object we want
      let profileObjectInit = {
        name: "",
        published: Date.now(),
        profileImage: "",
        description: "",
      }
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
      // this first checks for all the profiles
      const stream = this.$graffiti.discover(
        ['designftw'],
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