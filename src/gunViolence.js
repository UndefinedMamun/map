import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

import Axios from "axios";

const url =
  "https://sheets.googleapis.com/v4/spreadsheets/1nmDC51LMIni1GWL8zeoyAt9GDZUpyMgsTXAJnj9wShs/values/A1:G9999?key=AIzaSyBGnIg8FvCoFnzt6ubeBzu6Pl2WD1VK_1k";

const sourceData = "./gundata.json";

const scatterplot = data =>
  new ScatterplotLayer({
    id: "scatter",
    data: data,
    opacity: 0.8,
    filled: true,
    radiusMinPixels: 2,
    radiusMaxPixels: 5,
    getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
    getFillColor: d =>
      d.Appreciation.replace("%", "") > 0
        ? [200, 0, 40, 150]
        : [255, 140, 0, 100],

    pickable: true,
    onHover: ({ object, x, y }) => {
      const el = document.getElementById("tooltip");
      if (object) {
        const { n_killed, incident_id } = object;
        el.innerHTML = `<h1>ID ${incident_id} Killed: ${n_killed}</h1>`;
        el.style.display = "block";
        el.style.opacity = 0.9;
        el.style.left = x + "px";
        el.style.top = y + "px";
      } else {
        el.style.opacity = 0.0;
      }
    }

    // onClick: ({ object, x, y }) => {
    //   window.open(
    //     `https://www.gunviolencearchive.org/incident/${object.incident_id}`
    //   );
    // }
  });

const heatmap = () =>
  new HeatmapLayer({
    id: "heat",
    data: sourceData,
    getPosition: d => [number, d.latitude],
    getWeight: d => d.n_killed + d.n_injured * 0.5,
    radiusPixels: 60
  });

const hexagon = data =>
  new HexagonLayer({
    id: "hex",
    data: data,
    getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
    getElevationWeight: d => Number(d.Appreciation.replace("%", "")),
    elevationRange: [0, 1000],
    elevationScale: 10,
    extruded: true,
    radius: 60,
    opacity: 0.6,
    coverage: 0.88,
    // lowerPercentile: 50,

    pickable: true,
    onHover: test => {
      const { longitude, latitude, object, x, y } = test;
      console.log(test);
      const el = document.getElementById("tooltip");
      if (object) {
        // const { longitude, latitude } = object;
        el.innerHTML = `<h1>ID ${latitude} Killed: ${longitude}</h1>`;
        el.style.display = "block";
        el.style.opacity = 0.9;
        el.style.left = x + "px";
        el.style.top = y + "px";
        test.color = [255, 140, 0, 100];
      } else {
        el.style.opacity = 0.0;
      }
    }
  });

window.initMap = () => {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 36.1164315, lng: -115.1593261 },
    zoom: 14,
    styles: [
      {
        elementType: "geometry",
        stylers: [
          {
            color: "#212121"
          }
        ]
      },
      {
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off"
          }
        ]
      },
      {
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575"
          }
        ]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#212121"
          }
        ]
      },
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [
          {
            color: "#757575"
          }
        ]
      },
      {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e"
          }
        ]
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#bdbdbd"
          }
        ]
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575"
          }
        ]
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [
          {
            color: "#181818"
          }
        ]
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161"
          }
        ]
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#1b1b1b"
          }
        ]
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [
          {
            color: "#2c2c2c"
          }
        ]
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#8a8a8a"
          }
        ]
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          {
            color: "#373737"
          }
        ]
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [
          {
            color: "#3c3c3c"
          }
        ]
      },
      {
        featureType: "road.highway.controlled_access",
        elementType: "geometry",
        stylers: [
          {
            color: "#4e4e4e"
          }
        ]
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161"
          }
        ]
      },
      {
        featureType: "transit",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575"
          }
        ]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          {
            color: "#000000"
          }
        ]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#3d3d3d"
          }
        ]
      }
    ]
  });

  Axios.get(url).then(res => {
    //   console.log(res);

    const rows = res.data.values;
    if (!rows.length) {
      alert("No Data...");
      return;
    }
    const keys = rows[0];
    const data = rows.map((row, index) => {
      if (index === 0) return;

      const obj = {};
      keys.forEach((key, i) => {
        obj[key] = row[i];
      });
      return obj;
    });
    data.splice(0, 1);
    console.log(data);

    const overlay = new GoogleMapsOverlay({
      layers: [scatterplot(data), hexagon(data)]
    });

    overlay.setMap(map);
  });
};
