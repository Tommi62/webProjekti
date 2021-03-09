import HSLData from "../modules/hsl-data";
import RestaurantData from '../modules/restaurant-info';

let secondsFromMidnight;

/**
 * Sets time in seconds from midnight to be used with HSL departuretimes
 *
 */
const setTime = () => {
  const now = new Date();
  const then = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  secondsFromMidnight = Math.round((now.getTime() - then.getTime()) / 1000);
};

/**
 * Sets HSL header depending on the language the user is using
 *
 * @param {string} language - language 'fi' or 'en'
 */
const insertHslHeader = (language) => {
  const header = document.querySelector('.hslHeader');
  header.innerHTML = '';
  if (language === 'fi') {
    header.innerHTML = 'Aikataulut';
  } if (language === 'en') {
    header.innerHTML = 'Timetables';
  }
};

/**
 * Gets HSL stops by campus location and adds relevant stops outside the range
 *
 * @param {string} language - language 'fi' or 'en'
 * @param {string} currentCampus - current campus name
 */
const getStops = async (language, currentCampus) => {
  document.querySelector('.hsl-data').innerHTML = '';
  insertHslHeader(language);
  for (const restaurant of RestaurantData.restaurants) {
    if (restaurant.name === currentCampus) {
      if (restaurant.name === "myyrmaki") {
        loadHSLData("HSL:4150551");
        loadHSLData("HSL:4150501");
      }
      if (restaurant.name === "karamalmi") {
        loadHSLData("HSL:2132552");
        loadHSLData("HSL:2132502");
      }
      const stops = await HSLData.getStopsByLocation(
        restaurant.lat,
        restaurant.lon
      );
      for (const stop of stops.data.stopsByRadius.edges) {
        const id = stop.node.stop.gtfsId;
        loadHSLData(id);
      }
    }
  }
};

/**
 * checks if string is numeric
 *
 * @param {string} str
 * @returns {boolean} true or false
 */
const isNumeric = (str) => {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

/**
 * converts HSL departure time in seconds from seconds to departure to a user friendly string.
 *
 * @param {number} seconds
 * @returns {string}
 */
const timeString = (seconds) => {
  let minutes = Math.floor(seconds / 60);
  let time = "";
  if (minutes >= 60) {
    let hours = Math.floor(minutes / 60);
    time = hours + "h" + (minutes - hours * 60) + "min";
  } else {
    time = minutes + "min";
  }
  return time;
};

/**
 * Renders HSL stop to the web page and adds transition on :focus.
 *
 * @param {string} id - HSL stop id
 */
const loadHSLData = async (id) => {
  const result = await HSLData.getRidesByStopId(id);
  const stop = result.data.stop;
  const stopElement = document.createElement("div");
  const stopName = document.createElement("h3");
  const stopList = document.createElement("ul");
  stopList.classList.add("stopList");

  stopElement.className = "stop";

  stopName.innerHTML = `${stop.name}`;
  stopElement.appendChild(stopName);

  const isBusMetroTrain = stop.stoptimesWithoutPatterns[0].trip.routeShortName;
  let stopCategory = "";
  if (isNumeric(isBusMetroTrain.charAt(0))) {
    stopCategory = 'bus';
    stopElement.classList.add('busStop');
    const icon = document.createElement('div');
    icon.classList.add('hslBusIcon');
    stopElement.appendChild(icon);
  } else if (isBusMetroTrain.length === 1) {
    stopCategory = 'train';
    stopElement.classList.add('trainStop');
    const icon = document.createElement('div');
    icon.classList.add('hslTrainIcon');
    stopElement.appendChild(icon);
  } else if (isBusMetroTrain.length === 2) {
    stopCategory = 'metro';
    stopElement.classList.add('metroStop');
    const icon = document.createElement('div');
    icon.classList.add('hslMetroIcon');
    stopElement.appendChild(icon);
  }
  for (const ride of stop.stoptimesWithoutPatterns) {
    const departureSeconds = ride.scheduledDeparture - secondsFromMidnight;
    const departureTime = timeString(departureSeconds);
    if (departureSeconds >= 0) {
      const li = document.createElement("li");
      li.classList.add("timeTable");
      li.innerHTML += `
    <div class="time">${departureTime}</div>
    <div class="bus">${ride.trip.routeShortName}</div>
    <div class="destination">${ride.trip.tripHeadsign}</div>`;
      stopList.appendChild(li);
    }
  }
  stopName.tabIndex = 0;
  stopName.addEventListener("focus", () => {
    stopList.style.height = "195px";
  });
  stopName.addEventListener("focusout", () => {
    stopList.style.height = "0";
  });
  stopElement.appendChild(stopList);
  document.querySelector(".hsl-data").appendChild(stopElement);
};

export { getStops, setTime };
