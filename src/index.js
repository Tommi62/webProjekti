import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import { getLocation, getDistance } from './modules/calculate-distance';
import HSLData from './modules/hsl-data';
import {parseInfo, parseCampusInfo} from './modules/info-data';


const resContainer = document.querySelector('.restaurant');
const infoContainer = document.querySelector('.info');
const banner = document.querySelector('.banner');
const title = document.querySelector('.title');
const langFi = document.querySelector('.fi');
const langEn = document.querySelector('.en');
const myyrmaki = document.querySelector('.myyrmaki');
const karamalmi = document.querySelector('.karamalmi');
const myllypuro = document.querySelector('.myllypuro');
const arabia = document.querySelector('.arabia');
const carouselRight = document.querySelector('.carouselRight');
const carouselLeft = document.querySelector('.carouselLeft');
const footer = document.querySelector('.footer');

let carouselTimer;
let dateTimer;
let secondsFromMidnight;
let menuOpened = false;

const setTime = () => {
  const now = new Date();
  const then = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0);
  secondsFromMidnight = Math.round((now.getTime() - then.getTime()) / 1000);
  console.log('seconds from midnight: ' + secondsFromMidnight);
};

const restaurants = [{
  title_fi: 'Myyrmäen kampus',
  title_en: 'Myyrmäki campus',
  displayName: 'Myyrmäen Sodexo',
  name: 'myyrmaki',
  id: 152,
  lat: 60.2586191,
  long: 24.8432836,
  type: SodexoData
}, {
  title_fi: 'Karamalmin kampus',
  title_en: 'Karamalmi campus',
  displayName: 'Karaportin Fazer Food & Co',
  name: 'karamalmi',
  id: 270540,
  lat: 60.2238794,
  long: 24.7559603,
  type: FazerData
}, {
  title_fi: 'Myllypuron kampus',
  title_en: 'Myllypuro campus',
  displayName: 'Myllypuron Sodexo',
  name: 'myllypuro',
  id: 158,
  lat: 60.2236145,
  long: 25.0761622,
  type: SodexoData
}, {
  title_fi: 'Arabian kampus',
  title_en: 'Arabia campus',
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
  updateUi();
  for (const restaurant of restaurants) {
    if (restaurant.name === currentCampus) {
      try {
        const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, language, today);
        if (restaurant.type === SodexoData) {
          renderSodexoMenu(parsedMenu, restaurant.displayName);
        } else {
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

let slides = [];

const makeSlides = () => {
  slides.splice(0, slides.length);
  infoContainer.innerHTML = "";
  const data = parseInfo(language);
  for (const set of data) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    const h3 = document.createElement('h3');

    h3.innerHTML = set.title;
    slide.appendChild(h3);

    if (set.text !== "") {
      const ul = document.createElement('ul');
      for (const textNode of set.text) {
        const li = document.createElement('li');
        li.innerHTML = textNode;
        ul.appendChild(li);
      }
      slide.appendChild(ul);
    }
    slides.push(slide);
  }
};

const changeSlide = (direction) => {
  let slide = document.querySelector('.slide');
  slide.style.opacity = '0';
  if (direction === 'right') {
    slide.style.transform = ' scale(0.9) translate(-20%, 0%)';
  }
  if (direction === 'left') {
    slide.style.transform = ' scale(0.9) translate(20%, 0%)';
  }
  setTimeout(function () {
    slide.style.transform = 'none';
    infoContainer.innerHTML = "";
    infoContainer.appendChild(slides[carouselPosition]);
    slide = slides[carouselPosition];
    if (direction === 'right') {
      slide.style.transform = ' scale(0.9) translate(20%, 0%)';
    }
    if (direction === 'left') {
      slide.style.transform = ' scale(0.9) translate(-20%, 0%)';
    }
    setTimeout(function () {
      slide = document.querySelector('.slide');
      slide.style.opacity = '1';
      slide.style.transform = 'rotate(0turn) scale(1) translate(0%, 0%)';
    }, 10);
  }, 500);
};

let carouselPosition = 0;

const infoCarouselRight = () => {
  if (carouselPosition < slides.length - 1) {
    carouselPosition++;
    changeSlide('right');
  } else {
    carouselPosition = 0;
    changeSlide('right');
  }
};

const infoCarouselLeft = () => {
  if (carouselPosition > 0) {
    carouselPosition--;
    changeSlide('left');
  } else {
    carouselPosition = slides.length;
    carouselPosition--;
    changeSlide('left');
  }
};

const infoCarouselRefresh = () => {
  infoContainer.innerHTML = "";
  infoContainer.appendChild(slides[carouselPosition]);
  setTimeout(function () {
    const slide = document.querySelector('.slide');
    slide.style.opacity = '1';
  }, 500);
};

const clearCarouselTimer = () => {
  console.log('clearTimer');
  clearTimeout(carouselTimer);
  carouselTimer = setInterval(infoCarouselRight, 13000);
};

carouselRight.addEventListener('click', infoCarouselRight);
carouselLeft.addEventListener('click', infoCarouselLeft);
carouselLeft.addEventListener('click', clearCarouselTimer);
carouselRight.addEventListener('click', clearCarouselTimer);

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
  const stopName = document.createElement('h3');
  const stopList = document.createElement('ul');
  stopList.classList.add('stopList');

  stopElement.className = 'stop';
  if (language === 'fi') {
    stopName.innerHTML = `${stop.name}`;
    stopElement.appendChild(stopName);
  } else {
    stopName.innerHTML = `${stop.name}`;
    stopElement.appendChild(stopName);
  }
  for (const ride of stop.stoptimesWithoutPatterns) {
    const li = document.createElement('li');
    li.classList.add('timeTable');
    const departure = ride.scheduledDeparture - secondsFromMidnight;
    li.innerHTML += `
    <div class="time">${HSLData.formatTime(departure)}</div>
    <div class="bus">${ride.trip.routeShortName}</div>
    <div class="destination">${ride.trip.tripHeadsign}</div>`;
    stopList.appendChild(li);
  }
  stopName.tabIndex = 0;
  stopName.addEventListener('focus', () => {
    stopList.style.height = '195px';
  });
  stopName.addEventListener('focusout', () => {
    stopList.style.height = '0';
  });
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
      for (const restaurant of restaurants) {
        const distance = getDistance(currentLatitude, currentLongitude, restaurant.lat, restaurant.long, 'K');
        distances.push(distance);
      }
      const i = distances.indexOf(Math.min(...distances));
      currentCampus = restaurants[i].name;
      console.log('Ready ' + currentCampus);
      getMenu();
      getStops();
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

const createCampusInfo = (lang, campus) => {
  const data = parseCampusInfo(lang, campus);
  footer.innerHTML = '';
  for(const object of data){
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    h3.innerHTML = object.title;
    p.innerHTML = object.text;
    div.appendChild(h3);
    div.appendChild(p);
    footer.appendChild(div);
  }
  console.log('CampusInfo: ' + data);
};

const updateUi = () => {
  createCampusInfo(language, currentCampus);
  banner.style.backgroundImage = 'url("./assets/' + currentCampus +'.jpg")';
  for(const restaurant of restaurants){
    const campusButton = document.querySelector('.' + restaurant.name);
    if (!campusButton.classList.contains('campus')) {
      campusButton.classList.add('campus');
    }
    if (campusButton.classList.contains('activeCampus')) {
      campusButton.classList.remove('activeCampus');
    }
    if (restaurant.name === currentCampus) {
      campusButton.classList.remove('campus');
      campusButton.classList.add('activeCampus');
      if (language === 'fi') {
        title.innerHTML = restaurant.title_fi;
      } else {
        title.innerHTML = restaurant.title_en;
      }
    }
  }
  let activeLanguageButton;
  let inactiveLanguageButton;
  if (language === 'fi') {
    activeLanguageButton = document.querySelector('.fi');
    inactiveLanguageButton = document.querySelector('.en');
  } else {
    activeLanguageButton = document.querySelector('.en');
    inactiveLanguageButton = document.querySelector('.fi');
  }
  activeLanguageButton.classList.remove('notSelectedLanguage');
  activeLanguageButton.classList.add('selectedLanguage');
  inactiveLanguageButton.classList.remove('selectedLanguage');
  inactiveLanguageButton.classList.add('notSelectedLanguage');
};

const init = () => {
  setTime();
  getMenu();
  getStops();
  getNearestCampus();
  makeSlides();
  infoCarouselRefresh();
  carouselTimer = setInterval(infoCarouselRight, 13000);
  dateTimer = setInterval(setTime, 60000);
  const refreshStops = setInterval(getStops, 60000);
};

const refresh = () => {
  getMenu();
  getStops();
  makeSlides();
  infoCarouselRefresh();
};

langFi.addEventListener('click', () => {
  if (language === 'en') {
    language = 'fi';
    refresh();
  }
});


langEn.addEventListener('click', () => {
  if (language === 'fi') {
    language = 'en';
    refresh();
  }
});

myyrmaki.addEventListener('click', () => {
  currentCampus = 'myyrmaki';
  refresh();
  if(menuOpened){
    changeNavBar();
  }
});

karamalmi.addEventListener('click', () => {
  currentCampus = 'karamalmi';
  refresh();
  if(menuOpened){
    changeNavBar();
  }
});

myllypuro.addEventListener('click', () => {
  currentCampus = 'myllypuro';
  refresh();
  if(menuOpened){
    changeNavBar();
  }
});

arabia.addEventListener('click', () => {
  currentCampus = 'arabia';
  refresh();
  if(menuOpened){
    changeNavBar();
  }
});

const changeNavBar = () => {
  let x = document.querySelector('.navbar');
  if (x.className === "navbar") {
    x.className += " responsive";
    menuOpened = true;
  } else {
    x.className = "navbar";
    menuOpened = false;
  }
};

const navIcon = document.querySelector('.icon');
navIcon.addEventListener('click', () => {
  console.log('Click');
  changeNavBar();
});


init();
