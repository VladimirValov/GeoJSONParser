const axios = require("axios");
const fs = require("fs");
// Получение списка городов.

const cities = fs.readFileSync("cities.txt", "utf8");
const cityArray = cities.split("\n").filter((s) => !!s);

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

let i = 0;

planLoading();

function planLoading() {
  if (i === cityArray.length) {
    console.log("\nall Data downloaded");
    return;
  }
  const city = cityArray[i];
  i++;

  loadGeoJson(city).then((GeoJSON) => {
    console.log("downloading completed");
    if (GeoJSON) {
      console.log("\x1b[44m", `Saved ${city}.json`, "\x1b[0m");
      fs.writeFileSync(`./data/${city}.json`, JSON.stringify(GeoJSON));
    } else {
      console.log("data is emty");
    }
    planLoading();
  });
}

function loadGeoJson(city) {
  console.log(`\n${city}`);
  const searchUrl = `https://nominatim.openstreetmap.org/search.php?q=${ encodeURI(city) }&polygon_geojson=1&format=jsonv2`;
  return axios
    .get(searchUrl)
    .then((res) => {
      return res.data[0];
    })
    .then((target) => {
      if (target) {
        const geoJsonUrl = `http://polygons.openstreetmap.fr/get_geojson.py?id=${ target.osm_id }&params=0`;
        console.log("osm_id:", target.osm_id);
        return axios.get(geoJsonUrl);
      }
    })
    .then((geoJson) => {
      if (geoJson) {
        return geoJson.data;
      }
    })
    .catch((err) => console.log(err));
}
