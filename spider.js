var map = new L.Map('map', {
    center:[45.91315643050401,7.080688308924438],
    // maxBounds: [[44.8, 8.2], [47.5, 9]],
    minZoom: 0,
    maxZoom: 20,
    zoom: 12
});

// Define tile layers
var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
});
var esriImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '&copy; <a href="http://www.esri.com">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

osmLayer.addTo(map);

// Define base layers
var baseLayers = {
  "OpenStreetMap": osmLayer,
  "Photos aériennes ESRI": esriImagery,
};

    // function updateCenterCoords() {
    //   var center = map.getCenter();
    //   console.log('Center is at', center.lat, center.lng);
    //   }

//       busstop.features.forEach((feature, index) => {
//       const coords = feature.geometry.coordinates;
//       const getDistanceInKm = (map, inverted, coords)
//       console.log(map.distance(inverted, coords).toFixed(0)*0.001);
// });

//     }

    // On move end (after panning or zoom), update
    // map.on('move', updateCenterCoords);

    // // Also update initially
    // updateCenterCoords();

    // L.geoJSON(busstop).addTo(map);


// function updateCenterLatLng() {
//   // Compute center of the map container in pixels
//   const mapSize = map.getSize(); // {x: width, y: height}
//   const centerPixel = L.point(mapSize.x / 2, mapSize.y / 2);

//   // Convert pixel center to geographic LatLng
//   const centerLatLng = map.containerPointToLatLng(centerPixel);

//   console.log('mapcenter', centerLatLng); // prints LatLng of screen center
//   return centerLatLng;
// }

  // --- Helper function to convert GeoJSON coords to Leaflet LatLng ---
  function coordsToLatLng(coords) {
    if (Array.isArray(coords[0][0])) {
      coords = coords[0][0];
    }
    return L.latLng(coords[1], coords[0]);
  }

  // --- Layer groups for markers and lines ---
  const nearestMarkers = L.layerGroup().addTo(map);
  const nearestLines = L.layerGroup().addTo(map);

  // --- Function to update nearest 5 stations ---
  const centerMarker = L.marker(map.getCenter(), {
  icon: L.icon({
    iconUrl: 'marker.png',
    iconSize: [25, 41],    // size of the icon in pixels
  }),
  interactive: false
}).addTo(map);

  function updateNearestStations() {
    const center = map.getCenter();
    console.log('center', center)
    const mapSize = map.getSize(); // {x: width, y: height}
    const centerPixel = L.point(mapSize.x / 2, mapSize.y / 2);
    console.log('center pixel',centerPixel)

  // Convert pixel center to geographic LatLng
      const centerLatLng = map.containerPointToLatLng(centerPixel);



    // Compute distances
    const stopsWithDistance = busstop.features.map(feature => {
      const latLng = coordsToLatLng(feature.geometry.coordinates);
      const distance = map.distance(centerLatLng, latLng);
      return { feature, latLng, distance };
    });

    // Sort and pick 5 nearest
    const nearest5 = stopsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    // Clear previous markers and lines
    nearestMarkers.clearLayers();
    nearestLines.clearLayers();

    // Draw markers and lines
    nearest5.forEach(stop => {
      L.marker(stop.latLng)
        .addTo(nearestMarkers)
        .bindPopup(stop.feature.properties.name || 'Bus Stop');

      L.polyline([center, stop.latLng], { color: 'red', weight: 2 })
        .addTo(nearestLines);
    });
  }

  // --- Call once initially ---
  updateNearestStations();

  // --- Update continuously while panning ---
  map.on('move', updateNearestStations);

  function updateCenterMarker() {
  centerMarker.setLatLng(map.getCenter());
}

map.on('move', updateCenterMarker);
map.on('zoom', updateCenterMarker);
