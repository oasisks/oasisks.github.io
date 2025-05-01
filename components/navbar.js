export default {
    name: 'Navbar',
    template: `
      <nav id="navbar">
        <article id="search-bar"> 
          <router-link to="/">Home</router-link>
          <p>Search bar </p>
        </article>
        <ul>
            <li><router-link to="/community">Community</router-link></li>
            <li><router-link to="/favorites">Favorites</router-link></li>
            <li><router-link to="/profile">Profile</router-link></li>
            <li><button @click="logout">Log Out</button></li>
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