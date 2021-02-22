import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import {getLocation, getDistance} from './modules/calculate-distance';

const resContainer = document.querySelector('.restaurant');
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

const getMenu = async () =>{
  console.log('Toimii');
  for (const restaurant of restaurants) {
    if(restaurant.name === currentCampus){
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
        if(language === 'fi'){
          message = 'Tälle päivälle ei löydetty ruokalistaa.';
        } else{
          message = 'No menu was found for today.';
        }
        NoMenuFoundNotification(message, restaurant.displayName);
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

const NoMenuFoundNotification = (message, name) => {
  const restaurantName = '<h3>' + name + '</h3>';
  const noMenuMessage = `<p>${message}</p>`;
  resContainer.innerHTML += restaurantName;
  resContainer.innerHTML += noMenuMessage;
};

const nearestCampus = () => {
  getLocation()
  .then((position) => {
    const currentLatitude = position.coords.latitude;
    const currentLongitude = position.coords.longitude;
    const distance = getDistance(currentLatitude, currentLongitude, restaurants[1].lat, restaurants[1].long, 'K');
    alert('Dis: ' + distance);
  })
  .catch((err) => {
    console.error(err.message);
  });
};

nearestCampus();
getMenu();
