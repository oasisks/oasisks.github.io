export default {
    name: 'Navbar',
    props: ["userName"],
    data() {
      return {
        searchQuery: "",
        searchResults: [],
        showResults: false,
        searchTimeout: null,
        channels: ['designftw'],
        restaurants: [],
      }
    },
    template: `
      <nav id="navbar">
        <article id="search-bar"> 
          <input type="text" v-model="searchQuery" @input="onInput" @focus="onFocus" @blur="hideResults" placeholder="Search...">
          <ul class="search-results" v-if="showResults && searchResults.length !== 0">
            <li v-for="(restaurant, i) in searchResults" :key="i" @mousedown.prevent="selectRestaurant(restaurant)">{{ restaurant.value.object.name }}</li>
          </ul>

        </article>
        <ul>
            <li class="nav-item" :class="{ active: $route.path === '/' }">
              <router-link to="/">Home</router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.path.startsWith('/community') }">
              <router-link to="/community">Community</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="\`/profile/\${userName}\`">Profile</router-link>
            </li>
            <li class="nav-item">
              <button @click="logout">Log Out</button>
            </li>
        </ul>
      </nav>
    `,
    async mounted() {
      // we need to first generate a list of groups
      const schema = {
        properties: {
            value: {
                required: ['activity', 'object'],
                properties: {
                    activity: {type: 'string'},
                    object: {type: 'object'},
                }
            }
        }
      };
      const stream = this.$graffiti.discover(
        this.channels,
        schema,
        this.$graffitiSession.value
      )

      for await (const obj of stream) {
        const groupChatName = obj.object.value.object.name;
        if (groupChatName.includes("Restaurant: ")) {
          this.restaurants.push(obj.object);
        }
      }
      console.log(this.restaurants);
    },
    methods: {
      onFocus() {
        // to make life easier, if the user is in the same session, typed something\
        // then get out of focus, then get on focus, it will show the previous results
        this.showResults = this.searchResults.length !== 0;
      },
      onInput() {
        clearTimeout(this.searchTimeout);

        const query = this.searchQuery.trim();
        if (!query) {
          this.searchResults = [];
          this.showResults = false;
          return;
        }

        this.searchTimeout = setTimeout(() => {
          this.performSearch(query);
        }, 300);

        // console.log(query);
        // console.log(this.searchResults);
      },
      async performSearch(query) {
        const lower = query.toLowerCase();
        this.searchResults = this.restaurants.filter((restaurant) => {
          // console.log(restaurant.toLowerCase().includes(lower));
          return restaurant.value.object.name.toLowerCase().includes(lower);
        })
        this.showResults = true;
      },
      selectRestaurant(restaurant) {
        const chatID = restaurant.value.object.channel;
        const groupName = encodeURIComponent(restaurant.value.object.name);

        this.$router.push(`/community/${chatID}/${groupName}`);
        this.searchQuery = "";
        this.showResults = false;
      },
      hideResults() {
        setTimeout(() => this.showResults = false, 200);
      },

      login() {
        this.$graffiti.login();
      },
      logout() {
        this.$graffiti.logout(this.$graffitiSession.value);
      }
    }
};