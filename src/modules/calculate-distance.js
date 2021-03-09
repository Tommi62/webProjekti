/**
 * Retrieves the user's current location with geoloaction API.
 * @returns {promise} - If is gps allowed, returns current location.
 */
const getLocation = () => {
  if (navigator.geolocation) {
    console.log('Getlocation');
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    });
  } else {
    return 'nothing';
  }
};

/**
 * Takes latitude and longitude of two locations and returns the distance between them.
 * @param {number} lat1 - Latitude of first location.
 * @param {number} lon1 - Longitude of first location.
 * @param {number} lat2 - Latitude of second location.
 * @param {number} lon2 - Longitude of second location.
 * @param {string} unit - Defines in which unit the distance is returned.
 * @returns {number} - The distance between two locations.
 */
const getDistance = (lat1, lon1, lat2, lon2, unit) => {
	console.log('Getdistance');
  if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344; }
		if (unit=="N") { dist = dist * 0.8684; }
		return dist;
	}
};

export {getLocation, getDistance};
