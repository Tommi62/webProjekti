import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import {getLocation, getDistance} from './modules/calculate-distance';
import HSLData from './modules/hsl-data';

const resContainer = document.querySelector('.restaurant');
const langFi = document.querySelector('.fi');
const langEn = document.querySelector('.en');

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const today = new Date().toISOString().split('T')[0];
let currentCampus = 'myllypuro';
let language = 'fi';

const getMenu = async () => {
  console.log('getMenu');
  for (const restaurant of restaurants) {
    if (restaurant.name === currentCampus) {
      try {
          const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, language, today);
          if(restaurant.type === SodexoData){
            renderSodexoMenu(parsedMenu, restaurant.displayName);
          } else{
            renderMenu(parsedMenu, restaurant.displayName);
          }
      } catch (error) {
        console.error(error);
        let message;
        if (language === 'fi') {
          message = 'Tälle päivälle ei löydetty ruokalistaa.';
        } else {
          message = 'No menu was found for today.';
        }
        NoMenuFoundNotification(message, restaurant.displayName);
        console.log('current: ' + currentCampus);
      }
    }
  }
};

const renderMenu = (data, name) => {
  resContainer.innerHTML = '';
  const restaurantName = '<h3>' + name + '</h3>';
  const ul = document.createElement('ul');
  for (const item of data) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  resContainer.innerHTML += restaurantName;
  resContainer.appendChild(ul);
};

const renderSodexoMenu = (data, name) => {
  resContainer.innerHTML = '';
  const restaurantName = '<h3>' + name + '</h3>';
  const menuContainer = document.createElement('div');
  menuContainer.classList.add('menu');
  for (const item of data) {
    const mealContainer = document.createElement('div');
    mealContainer.classList.add('menuItem');

    const nameContainer = document.createElement('div');
    nameContainer.classList.add('menuName');
    nameContainer.innerHTML = '<h4>' + item.category + '</h4>';
    nameContainer.innerHTML += '<p>' + item.title + '</p>';

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('mealInfo');

    const priceContainer = document.createElement('div');
    priceContainer.classList.add('menuPrice');
    priceContainer.innerHTML = '<br><p>' + item.price + '</p>';

    const codeContainer = document.createElement('div');
    codeContainer.classList.add('menuCode');
    codeContainer.innerHTML = '<br><p>' + item.code + '</p>';

    infoContainer.appendChild(priceContainer);
    infoContainer.appendChild(codeContainer);
    mealContainer.appendChild(nameContainer);
    mealContainer.appendChild(infoContainer);
    menuContainer.appendChild(mealContainer);
  }
  resContainer.innerHTML += restaurantName;
  resContainer.appendChild(menuContainer);
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
  console.log('NoMenuFound ' + name);
  resContainer.innerHTML = '';
  const restaurantName = '<h3>' + name + '</h3>';
  const noMenuMessage = `<p>${message}</p>`;
  resContainer.innerHTML = restaurantName;
  resContainer.innerHTML += noMenuMessage;
};

const getNearestCampus = () => {
  let distances = [];
  getLocation()
  .then((position) => {
    const currentLatitude = position.coords.latitude;
    const currentLongitude = position.coords.longitude;
    for(const restaurant of restaurants){
      const distance = getDistance(currentLatitude, currentLongitude, restaurant.lat, restaurant.long, 'K');
      distances.push(distance);
    }
    const i = distances.indexOf(Math.min(...distances));
    currentCampus = restaurants[i].name;
    console.log('Ready ' + currentCampus);
    getMenu();
  })
  .catch((err) => {
    console.error(err.message);
    getMenu();
  });
};

const getStops = async () => {
  for (const restaurant of restaurants) {
    if (restaurant.name === currentCampus) {
      const stops = await HSLData.getStopsByLocation(restaurant.lat, restaurant.long);
      for (const stop of stops.data.stopsByRadius.edges) {
        const id = stop.node.stop.gtfsId;
        loadHSLData(id);
      }
    }
  }
};

const init = () => {
  getNearestCampus();
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


init();
