import { defineAsyncComponent } from 'vue';

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/homepage.html").then((r) => r.text())
  return {
    name: 'HomePage',
    template: template,
    data() {
        return {
            creatingGroup: false,
            groupNameSet: new Set(),
            channels: ["designftw"],
        }
    },
    computed: {

    },
    async mounted() {
        const schema = {
            value: {
                required: ["activity", "object"],
                properties: {
                    activity: {type: 'string'},
                    object: {type: 'object'},
                }
            }
        };

        const stream = this.$graffiti.discover(
            this.channels,
            schema,
            this.$graffitiSession.value
        );
        for await (const obj of stream) {
            if (obj.object.value.activity === "Create") {
                this.groupNameSet.add(obj.object.value.object.name);
            }
        }  

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

        const infoWindow = new google.maps.InfoWindow();
  
        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(
            { location: center, radius: 5000, type: 'restaurant' },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach(place => {
                        const marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            title: place.name
                        });
                        let group_name = `Restaurant: ${place.name}`;
                        if (!this.groupNameSet.has(group_name)) {
                            this.createGroup(this.$graffitiSession.value, group_name);
                        }
                        marker.addListener('click', () => {
                            service.getDetails({
                                placeId: place.place_id,
                                fields: [
                                    "name", 
                                    "vicinity",
                                    "rating",
                                    "formatted_phone_number",
                                    "opening_hours",
                                ]
                            }, (detail, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK) {
                                    console.log(detail);
                                }

                                let address = detail.vicinity;
                                let rating = detail.rating;
                                let formatted_phone_number = detail.formatted_phone_number;
                                let opening_hours = detail.opening_hours;
                                
                                let opening_hour_html;
                                if (opening_hours) {
                                    opening_hour_html = "<p class='info-item'><strong>Hours:</strong></p><article class='hours-status'>\n<ul>";
                                    opening_hours.weekday_text.forEach((hour) => {
                                        opening_hour_html += "\n<li class='hours-line'>" + hour + "</li>";
                                    })
                                    opening_hour_html += "\n</ul></article>";
                                } else {
                                    opening_hour_html = "<p class='info-item'><strong>Hours:</strong> No info at the moment.</p>";
                                }
                                infoWindow.setContent(
                                    `
                                    <section class="info-window">
                                        <h2 class="info-title">${place.name}</h2>
                                        <p class="info-item"><strong>Address:</strong> ${address || 'No info at the moment'}</p>
                                        <p class="info-item"><strong>Rating:</strong> ${rating != null ? rating : 'No info at the moment'}</p>
                                        <p class="info-item"><strong>Phone:</strong> ${formatted_phone_number || 'No info at the moment'}</p>
                                        ${opening_hour_html}
                                    </section>
                                    `
                                );
                                infoWindow.open(map, marker);
                            })
                        })
                    })
                }
                else {
                    console.log("PlaceServices Failed:", status);
                }
            }
        );
    },
    methods: {
        async createGroup(session, groupName) {
            if (!groupName) return;
            this.creatingGroup = true;
    
            await this.$graffiti.put(
            {
                value: {
                activity: 'Create',
                object: {
                    type: 'Group Chat',
                    name: groupName,
                    channel: crypto.randomUUID(),
                }
                },
                channels: this.channels,
            },
            session,
            );
            this.creatingGroup = false;
        }
    }
  };
});
  