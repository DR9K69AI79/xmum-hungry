// Map Container Web Component
class MapContainer extends HTMLElement {
    constructor() {
        super();
        this.map = null;
        this.markers = [];
        this.userLocation = null;
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="map" style="height: 100vh; width: 100%; position: relative; z-index: 1;"></div>
        `;
        this.initMap();
    }

    async initMap() {
        try {
            // Initialize Leaflet map
            this.map = L.map('map').setView([2.832889, 101.702889], 16); // XMUM coordinates

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Try to get user's current location
            await this.getCurrentLocation();

            // Add custom controls
            this.addCustomControls();

            // Listen for marker clicks
            this.map.on('click', () => {
                // Hide mini card when clicking on empty map area
                const miniCard = document.querySelector('mini-card');
                if (miniCard) {
                    miniCard.hide();
                }
            });

        } catch (error) {
            console.error('Map initialization error:', error);
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.warn('Geolocation not supported');
                resolve();
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.userLocation = [latitude, longitude];
                    
                    // Check if within XMUM area (approximate)
                    const xmumBounds = {
                        north: 2.840,
                        south: 2.825,
                        east: 101.710,
                        west: 101.695
                    };
                    
                    if (latitude >= xmumBounds.south && latitude <= xmumBounds.north &&
                        longitude >= xmumBounds.west && longitude <= xmumBounds.east) {
                        // User is on campus, center map on their location
                        this.map.setView([latitude, longitude], 17);
                    }
                    
                    // Add user location marker
                    const userMarker = L.marker([latitude, longitude], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })
                    }).addTo(this.map);
                    
                    userMarker.bindPopup('您的位置').openPopup();
                    
                    resolve();
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    resolve(); // Don't reject, just continue without location
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    addCustomControls() {
        // Add zoom control
        L.control.zoom({
            position: 'bottomleft'
        }).addTo(this.map);

        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false
        }).addTo(this.map);
    }

    setRestaurants(restaurants) {
        // Clear existing markers
        this.clearMarkers();

        if (!restaurants || restaurants.length === 0) {
            return;
        }

        // Add new markers
        restaurants.forEach((restaurant, index) => {
            const marker = this.createRestaurantMarker(restaurant, index);
            this.markers.push(marker);
        });

        // Fit map to show all markers
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }

        // Show first restaurant in mini card
        if (restaurants.length > 0) {
            this.highlightRestaurant(restaurants[0]);
        }
    }

    createRestaurantMarker(restaurant, index) {
        const marker = L.marker([restaurant.lat, restaurant.lng], {
            icon: L.divIcon({
                className: 'restaurant-marker',
                html: `
                    <div class="marker-content" style="
                        background: var(--xmum-red, #c41e3a);
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 12px;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    ">
                        ${index + 1}
                    </div>
                `,
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            })
        }).addTo(this.map);

        // Add click event
        marker.on('click', () => {
            this.highlightRestaurant(restaurant);
        });

        // Add hover effects
        marker.on('mouseover', function() {
            this.getElement().style.transform = 'scale(1.1)';
        });

        marker.on('mouseout', function() {
            this.getElement().style.transform = 'scale(1)';
        });

        return marker;
    }

    highlightRestaurant(restaurant) {
        // Dispatch event to show mini card
        const event = new CustomEvent('highlight-restaurant', {
            detail: restaurant,
            bubbles: true
        });
        this.dispatchEvent(event);

        // Center map on restaurant
        this.map.setView([restaurant.lat, restaurant.lng], 17, {
            animate: true,
            duration: 0.5
        });
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Method to add a single restaurant marker (for admin)
    addRestaurant(restaurant) {
        const marker = this.createRestaurantMarker(restaurant, this.markers.length);
        this.markers.push(marker);
        return marker;
    }

    // Method to remove a restaurant marker (for admin)
    removeRestaurant(restaurantId) {
        const markerIndex = this.markers.findIndex(marker => 
            marker.options.restaurantId === restaurantId
        );
        
        if (markerIndex !== -1) {
            this.map.removeLayer(this.markers[markerIndex]);
            this.markers.splice(markerIndex, 1);
        }
    }

    // Method to get map bounds
    getBounds() {
        return this.map.getBounds();
    }

    // Method to set map view
    setView(lat, lng, zoom = 16) {
        this.map.setView([lat, lng], zoom);
    }
}

// Register the custom element
customElements.define('map-container', MapContainer);

