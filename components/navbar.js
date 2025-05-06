export default {
    name: 'Navbar',
    props: ["userName"],
    template: `
      <nav id="navbar">
        <article id="search-bar"> 
          <input type="text">
          <button>Search</button>
        </article>
        <ul>
            <li class="nav-item" :class="{ active: $route.path === '/' }">
              <router-link to="/">Home</router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.path.startsWith('/community') }">
              <router-link to="/community">Community</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/favorites">Favorites</router-link>
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
    methods: {
      login() {
        this.$graffiti.login();
      },
      logout() {
        this.$graffiti.logout(this.$graffitiSession.value);
      }
    }
};