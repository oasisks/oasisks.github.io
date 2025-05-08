import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/homepage.html").then((r) => r.text())
  return {
    name: 'HomePage',
    template: template,
    mounted() {
        if (typeof google === "undefined" || !google.maps) {
            console.log("Google Maps JS API not loaded!");
            return;
        }
        const center = { lat: 42.3601, lng: -71.0942 };
        const map = new google.maps.Map(
            this.$el.querySelector('#googleMap'),
            {
                center,
                zoom: 15,
                styles: [
                    { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] }
                ]
            }
        );
  
        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(
            { location: center, radius: 5000, type: 'restaurant' },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach(place => {
                        new google.maps.Marker({
                            map,
                            position: place.geometry.location,
                            title: place.name
                        }
                    );
                }
            );
            } else {
                console.log('PlacesService failed:', status);
            }
        }
    );
    }
  };
});
  