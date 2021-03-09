import {fetchPostJson} from "./network";

const apiUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

/**
 * Gets all the departuring rides from a single stop.
 *
 * @param {number} id - stop id
 * @returns list of departuring HSL rides.
 */
const getRidesByStopId = async (id) => {
  const query = `{
    stop(id: "${id}") {
      name
      stoptimesWithoutPatterns {
        scheduledArrival
        realtimeArrival
        arrivalDelay
        scheduledDeparture
        realtimeDeparture
        departureDelay
        realtime
        realtimeState
        serviceDay
        headsign
        trip {
          routeShortName
          tripHeadsign
        }
      }
    }
  }`;
  let stopData = '';
  try {
    stopData = await fetchPostJson(apiUrl, 'application/graphql', query);
  } catch (error) {
    throw new Error(error.message);
  }
  return stopData;
};

/**
 * Fetches HSL stations by name and returns them as an object.
 *
 * @param {string} name - Train station name
 * @returns json - stop data
 */
const getStationsByName = async (name) => {
  const query = `{
    stations(name: "${name}") {
      gtfsId
      name
      lat
      lon
      stops {
        gtfsId
        name
        code
        platformCode
      }
    }
  }`;
  let stationsData = '';
  try {
    stationsData = await fetchPostJson(apiUrl, 'application/graphql', query);
  } catch (error) {
    throw new Error(error.message);
  }
  return stationsData;
};

/**
 * Gets HSL stops within the radius of 500 meters with coordinates and returns them as an object.
 *
 * @param {number} lat - latitude
 * @param {number} lon - longitude
 * @returns json - stops at coordinates inside radius
 */
const getStopsByLocation = async (lat, lon) => {
  const query = `{
    stopsByRadius(lat:${lat}, lon:${lon}, radius:500) {
      edges {
        node {
          stop {
            gtfsId
            name
          }
          distance
        }
      }
    }
  }`;
  let stopData = '';
  try {
    stopData = await fetchPostJson(apiUrl, 'application/graphql', query);
  } catch (error) {
    throw new Error(error.message);
  }
  return stopData;
};

/**
 * Converts HSL time to more readable format
 *
 * @param {number} seconds - since midnight
 * @returns {string} HH:MM
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) - (hours * 60);
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

const HSLData = {getRidesByStopId, getStopsByLocation, getStationsByName, formatTime};
export default HSLData;
