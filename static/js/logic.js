// Create the tile layer that will be the background of our map - NYC
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
  Indoor: new L.LayerGroup(),
  Outdoor: new L.LayerGroup(),
  Limited: new L.LayerGroup(),
  Subway: new L.LayerGroup()
};

// Create the map with our layers
var map = L.map("map-id", {
  center: [40.73, -74.0059],
  zoom: 12,
  layers: [
    layers.Indoor,
    layers.Outdoor,
    layers.Limited,
    layers.Subway
  ]
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

// Create an overlays object to add to the layer control
var overlays = {
  "Indoor": layers.Indoor,
  "Outdoor": layers.Outdoor,
  "Limited": layers.Limited,
  "Subway": layers.Subway
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
var icons = {
  Indoor: L.ExtraMarkers.icon({
    icon: "ion-wifi",
    iconColor: "white",
    markerColor: "orange",
    shape: "star"
  }),
  Outdoor: L.ExtraMarkers.icon({
    icon: "ion-wifi",
    iconColor: "white",
    markerColor: "green",
    shape: "circle"
  }),
  Limited: L.ExtraMarkers.icon({
    icon: "ion-wifi",
    iconColor: "white",
    markerColor: "red",
    shape: "penta"
  }),
  Subway: L.ExtraMarkers.icon({
    icon: "ion-wifi",
    iconColor: "white",
    markerColor: "blue",
    shape: "square"
  })
};

// Perform an API call to the NYC Data WiFi Station Information endpoint
d3.json("https://data.cityofnewyork.us/resource/varh-9tsp.json", function(response) {

    var stationInfo = response;

    // Create an object to keep of the number of markers in each layer
    var stationCount = {
      Indoor: 0,
      Outdoor: 0,
      Limited: 0,
      Subway: 0
    };

    // Initialize a stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for layer group
    var stationStatusCode;

    // Loop through the WiFi stations 
    for (var i = 0; i < stationInfo.length; i++) {

      // Create a new station object with properties of both station objects
      var station = Object.assign({}, stationInfo[i]);
      // If a station is indoor 
    if (station.type === "Free" && station.location_t.includes("Indoor") || station.location_t.includes("Library")) {
        // console.log("Executed inside If")
        stationStatusCode = "Indoor";
      }
      // If a station is outdoors
    else if (station.type === "Free" && station.location_t.includes("Outdoor")) {
        stationStatusCode = "Outdoor";
      }
    else if (station.location_t.includes("Subway")) {
        stationStatusCode = "Subway"
    }
      // Otherwise the station is Limited
      else {
        stationStatusCode = "Limited";
      }

      if (!station.remarks) {
        station.remarks = "ヽ(ヅ)ノ"
      }

      if (station.remarks.includes("SN")) {
        station.remarks = "¯\_(ツ)_/¯"
      }

      // Update the station count
      stationCount[stationStatusCode]++;
      // Create a new marker with the appropriate icon and coordinates
      var newMarker = L.marker([station.lat, station.lon], {
        icon: icons[stationStatusCode]
      });

      // Add the new marker to the appropriate layer
      newMarker.addTo(layers[stationStatusCode]);

      // Bind a popup to the marker that will  display on click. This will be rendered as HTML
      newMarker.bindPopup("Station Name: " + station.name + "<br> Type: " + station.type + "<br>"+ " Location: " + station.location_t + "<br>"+ " SSID: " + station.ssid + "<br>"+ " Remarks: " + station.remarks);
    }

    // Call the updateLegend function, which will update the legend!
    updateLegend(stationCount);
});

// Update the legend's innerHTML with the station count
function updateLegend(stationCount) {
  document.querySelector(".legend").innerHTML = [
    "<p class ='normal'> Summary: <p>",
    "<p class='low'>Free Indoor Stations: " + stationCount.Indoor + "</p>",
    "<p class='healthy'>Free Outdoor Stations: " + stationCount.Outdoor + "</p>",
    "<p class='empty'>Limited Free: " + stationCount.Limited + "</p>",
    "<p class='out-of-order'>Subway Station: " + stationCount.Subway + "</p>"
  ].join("");
}
