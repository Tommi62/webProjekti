import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import HSLData from './modules/hsl-data';


const menuContainer = document.querySelector('.restaurant');
const langFi = document.querySelector('.fi');
const langEn = document.querySelector('.en');
const myyrmaki = document.querySelector('.myyrmaki');
const karamalmi = document.querySelector('.karamalmi');
const myllypuro = document.querySelector('.myllypuro');
const arabia = document.querySelector('.arabia');

const restaurants = [{
  displayName: 'Myyrmäen Sodexo',
  name: 'myyrmaki',
  id: 152,
  lat: 60.2586191,
  long: 24.8432836,
  type: SodexoData
}, {
  displayName: 'Karaportin Fazer Food & Co',
  name: 'karamalmi',
  id: 270540,
  lat: 60.2238794,
  long: 24.7559603,
  type: FazerData
}, {
  displayName: 'Myllypuron Sodexo',
  name: 'myllypuro',
  id: 158,
  lat: 60.2236145,
  long: 25.0761622,
  type: SodexoData
}, {
  displayName: 'Arabian Sodexo',
  name: 'arabia',
  id: 158,
  lat: 60.2103774,
  long: 24.9788837,
  type: SodexoData
}];

const today = new Date().toISOString().split('T')[0];
let currentCampus = 'arabia';
let language = 'fi';

const getMenu = async () => {
  for (const restaurant of restaurants) {
    if (restaurant.name === currentCampus) {
      try {
        const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, language, today);
        renderMenu(parsedMenu, restaurant.displayName);

      } catch (error) {
        console.error(error);
        let message;
        if (language === 'fi') {
          message = 'Tälle päivälle ei löydetty ruokalistaa.';
        } else {
          message = 'No menu was found for today.';
        }
        NoMenuFoundNotification(message, restaurant.displayName);
      }
    }
  }
};

const renderMenu = (data, name) => {
  menuContainer.innerHTML = '';
  const restaurantName = '<h3>' + name + '</h3>';
  const ul = document.createElement('ul');
  for (const item of data) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  menuContainer.innerHTML += restaurantName;
  menuContainer.appendChild(ul);
};

const loadHSLData = async (id) => {
  document.querySelector('.hsl-data').innerHTML = '';
  const result = await HSLData.getRidesByStopId(id);
  const stop = result.data.stop;
  const stopElement = document.createElement('div');
  const stopList = document.createElement('ul');
  if (language === 'fi') {
    stopElement.innerHTML = `<h3>Seuraavat vuorot pysäkiltä ${stop.name}</h3>`;
  } else {
    stopElement.innerHTML = `<h3>Next shifts from the stop ${stop.name}</h3>`;
  }
  for (const ride of stop.stoptimesWithoutPatterns) {
    stopList.innerHTML += `<li>${ride.trip.routeShortName},
      ${ride.trip.tripHeadsign},
      ${HSLData.formatTime(ride.scheduledDeparture)}</li>`;
  }
  stopElement.appendChild(stopList);
  document.querySelector('.hsl-data').appendChild(stopElement);
};

const NoMenuFoundNotification = (message, name) => {
  const restaurantName = '<h3>' + name + '</h3>';
  const noMenuMessage = `<p>${message}</p>`;
  menuContainer.innerHTML += restaurantName;
  menuContainer.innerHTML += noMenuMessage;
};

const getStops = async () => {
  for (const restaurant of restaurants) {
    if (restaurant.name === currentCampus) {
      console.log('rest coords = ' + restaurant.lat + ' ' + restaurant.long);
      const stops = await HSLData.getStopsByLocation(restaurant.lat, restaurant.long);
      for (const stop of stops.data.stopsByRadius.edges) {
        const id = stop.node.stop.gtfsId;
        loadHSLData(id);
      }
    }
  }
};

const init = () => {
  getMenu();
  getStops();
};

langFi.addEventListener('click', () => {
  if (language === 'en') {
    language = 'fi';
    init();
  }
});

langEn.addEventListener('click', () => {
  if (language === 'fi') {
    language = 'en';
    init();
  }
});

myyrmaki.addEventListener('click', () => {
    currentCampus = 'myyrmaki';
    init();
});

karamalmi.addEventListener('click', () => {
  currentCampus = 'karamalmi';
  init();
});

myllypuro.addEventListener('click', () => {
  currentCampus = 'myllypuro';
  init();
});

arabia.addEventListener('click', () => {
  currentCampus = 'arabia';
  init();
});


init();
