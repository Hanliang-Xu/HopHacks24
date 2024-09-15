// Make sure to add this script in your `script.js` file
document.addEventListener("DOMContentLoaded", function () {

    // Initialize the map

    var map = L.map('map').setView([39.2904, -76.6122], 10); // Example coordinates, you can adjust them

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    regions = [
        "Eastern Shore",
        "Southern",
        "Northwest",
        "Baltimore Metro",
        "Baltimore Metro",
        "Baltimore Metro",
        "Montgomery",
        "Prince George\'s",
        "Baltimore City",
    ]

    var colors = ["#FBC","#F99","#F66","#F33","#F00","#C00","#900"] // light to dark


    // Fetch the coordinates from the JSON file
    for (let i = 0; i < regions.length; i++) {
        fetch(`${regions[i]}.json`)
        .then(response => response.json()) // Parse the JSON file
        .then(data => {
            // Process each coordinate list and add them to the map
            var polygon = L.polygon(data.coordinates, {
                color: 'red',
                fillColor: colors[i],
                fillOpacity: 0.5
            }).addTo(map);
            
            polygon.bindPopup(`${regions[i]}`);

            // Automatically fit the map bounds to the polygon
            map.fitBounds(polygon.getBounds());
        })
        .catch(error => console.log('Error loading JSON data:', error));
    }
});