const BoostSpatialIndex = require("boost-geospatial-index");

function generateRandomCoordinates() {
  // Generate random latitude between 70 and 90 degrees
  const latitude = Math.random() * (90 - 70) + 70;

  // Generate random longitude between -180 and 180 degrees
  const longitude = Math.random() * 360 - 180;

  const radius = Math.random() * (2000 - 200) + 200;
  return { latitude, longitude, radius };
}

const areaPointsNear = (checkPoint, centerPoint, maxDistance) => {
  const earthRadius = 6371000; // Radius of the Earth in meters
  // Convert latitude and longitude to radians
  const lat1Rad = (checkPoint.latitude * Math.PI) / 180;
  const lon1Rad = (checkPoint.longitude * Math.PI) / 180;
  const lat2Rad = (centerPoint.latitude * Math.PI) / 180;
  const lon2Rad = (centerPoint.longitude * Math.PI) / 180;

  // Calculate the differences between the coordinates
  const latDiff = lat2Rad - lat1Rad;
  const lonDiff = lon2Rad - lon1Rad;

  // Calculate the distance using the Haversine formula
  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance < maxDistance;
};

const locations = [];
const bsi = new BoostSpatialIndex();

for (let i = 0; i < 100000; i++) {
  const location = generateRandomCoordinates();
  locations.push(location);
  bsi.addCircle(
    "random name" + i,
    location.latitude,
    location.longitude,
    location.radius
  );
}

console.log("locations added to bsi", new Date());

const searchLocations = [];
for (let i = 0; i < 10000; i++) {
  const location = generateRandomCoordinates();
  searchLocations.push({
    latitude: location.latitude,
    longitude: location.longitude,
  });
}

console.log("search locations added", new Date());

let foundUsingLoop = 0;
for (let i = 0; i < searchLocations.length; i++) {
  for (j = 0; j < locations.length; j++) {
    const found = areaPointsNear(
      searchLocations[i],
      locations[j],
      locations[j].radius
    );
    if (found) {
      foundUsingLoop++;
      break;
    }
  }
}

console.log("locations search ended using looping", new Date(), foundUsingLoop);

let foundUsingBsi = 0;
for (let i = 0; i < searchLocations.length; i++) {
  const found = bsi.queryPoint(
    searchLocations[i].latitude,
    searchLocations[i].longitude
  );
  if (found.length) {
    foundUsingBsi++;
  }
}

console.log("locations search ended using bsi", new Date(), foundUsingBsi);
