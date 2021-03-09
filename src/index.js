import { getLocation, getDistance } from "./modules/calculate-distance";
import HSLData from "./modules/hsl-data";
import { parseCampusInfo } from "./modules/info-data";
import { getWeatherLatLon } from './modules/weather-data';
import { handleTouchStart, handleTouchMove } from './modules/swiper';
import RestaurantData from './modules/restaurant-info';
import { makeSlides, infoCarouselRefresh } from './modules/slide-controller';
import { addBackgroundParallax } from './modules/background-parallax';

const resContainer = document.querySelector(".restaurant");
const banner = document.querySelector(".banner");
const title = document.querySelector(".title");
const langFi = document.querySelector(".fi");
const langEn = document.querySelector(".en");
const myyrmaki = document.querySelector(".myyrmaki");
const karamalmi = document.querySelector(".karamalmi");
const myllypuro = document.querySelector(".myllypuro");
const arabia = document.querySelector(".arabia");
const footer = document.querySelector(".footer");
const mediaQuery = window.matchMedia('(max-width: 500px)');

let secondsFromMidnight;
let menuOpened = false;

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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

let today = new Date().toISOString().split("T")[0];
let todayAlt = new Date().toLocaleDateString();
let dateVar = new Date();
let currentCampus = localStorage.getItem("currentCampus") || "myllypuro";
let language = localStorage.getItem("language") || "fi";

const getMenu = async () => {
  updateUi();
  for (const restaurant of RestaurantData.restaurants) {
    if (restaurant.name === currentCampus) {
      try {
        const parsedMenu = await restaurant.type.getDailyMenu(
          restaurant.id,
          language,
          today
        );
        if (parsedMenu != "") {
          if (restaurant.type === RestaurantData.SodexoData) {
            renderSodexoMenu(parsedMenu, restaurant.displayName);
          } else {
            renderFazerMenu(parsedMenu, restaurant.displayName);
          }
        } else {
          noMenuError(restaurant);
        }
      } catch (error) {
        console.error(error);
        noMenuError(restaurant);
      }
    }
  }
};

const noMenuError = (restaurant) => {
  let message;
  if (language === "fi") {
    message = "Tälle päivälle ei löydetty ruokalistaa.";
  } else {
    message = "No menu was found for today.";
  }
  NoMenuFoundNotification(message, restaurant.displayName);
  console.log("current: " + currentCampus);
};

const swipeChangeMenuDay = (evt) => {
  let touch = handleTouchMove(evt);
  if (touch === 'right') {
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(20%, 0%)";
    setTimeout(function () {
      changeDay("backward");
    }, 300);
  }
  if (touch === 'left') {
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(-20%, 0%)";
    setTimeout(function () {
      changeDay("forward");
    }, 300);
  }
};

resContainer.addEventListener('touchstart', handleTouchStart);
resContainer.addEventListener('touchmove', swipeChangeMenuDay);

const renderFazerMenu = (data, name) => {
  resContainer.innerHTML = "";
  const titleDiv = createTitleDiv(name);
  const content = document.createElement('div');
  content.classList.add('fazerContent');
  const ul = document.createElement("ul");
  for (const item of data) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  const priceContainer = createPriceContainer();
  content.appendChild(ul);
  content.appendChild(priceContainer);
  resContainer.appendChild(titleDiv);
  resContainer.appendChild(content);
  addResCarouselEventListeners();
};

const createPriceContainer = () => {
  const priceContainer = document.createElement('div');
  priceContainer.classList.add('fazerPrices');
  const priceList = document.createElement('h4');

  if (language === 'fi') {
    priceList.innerHTML = 'Hinnasto';
  } else {
    priceList.innerHTML = 'Price list';
  }
  priceContainer.appendChild(priceList);
  for (const object of RestaurantData.fazerPrices) {
    const container = document.createElement('div');
    container.classList.add('priceListObject');
    const group = document.createElement('h5');
    const price = document.createElement('p');
    if (language === 'fi') {
      group.innerHTML = object.group_fi;
    } else {
      group.innerHTML = object.group_en;
    }
    price.innerHTML = object.prices;
    container.appendChild(group);
    container.appendChild(price);
    priceContainer.appendChild(container);
  }
  return priceContainer;
};

const renderSodexoMenu = (data, name) => {
  resContainer.innerHTML = "";
  const titleDiv = createTitleDiv(name);
  const menuContainer = document.createElement("div");
  menuContainer.classList.add("menu");
  for (const item of data) {
    const mealContainer = document.createElement("div");
    mealContainer.classList.add("menuItem");

    const nameContainer = document.createElement("div");
    nameContainer.classList.add("menuName");
    if (language === 'en') {
      const translated = translateCategoryName(item.category);
      nameContainer.innerHTML = "<h4>" + translated + "</h4>";
    } else {
      nameContainer.innerHTML = "<h4>" + item.category + "</h4>";
    }
    nameContainer.innerHTML += "<p>" + item.title + "</p>";

    const infoContainer = document.createElement("div");
    infoContainer.classList.add("mealInfo");

    const priceContainer = document.createElement("div");
    priceContainer.classList.add("menuPrice");
    const price = handleChange(mediaQuery, item.price);
    priceContainer.innerHTML = "<br><p>" + price + "</p>";

    const codeContainer = document.createElement("div");
    codeContainer.classList.add("menuCode");
    if (item.code !== undefined) {
      codeContainer.innerHTML = "<br><p>" + item.code + "</p>";
    } else {
      codeContainer.innerHTML = "<br><p>" + ' ' + "</p>";
    }

    infoContainer.appendChild(priceContainer);
    infoContainer.appendChild(codeContainer);
    mealContainer.appendChild(nameContainer);
    mealContainer.appendChild(infoContainer);
    menuContainer.appendChild(mealContainer);
  }
  resContainer.appendChild(titleDiv);
  resContainer.appendChild(menuContainer);
  addResCarouselEventListeners();
};

const translateCategoryName = (name) => {
  if (RestaurantData.menuTranslator.hasOwnProperty(name)) {
    const translated = RestaurantData.menuTranslator[name];
    return translated;
  } else {
    return name;
  }
};

const handleChange = (e, price) => {
  if (e.matches) {
    console.log('Media Query Matched!');
    let modPrice = price.replace(/\//g, '');
    let regex = /\s+([€])/g;
    return modPrice.replace(regex, '€');
  } else {
    return price;
  }
};

mediaQuery.addListener(handleChange);

const createTitleDiv = (name) => {
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("resTitle");
  const arrowLeft = document.createElement("div");
  arrowLeft.classList.add("resCarouselLeft");
  const leftImg =
    '<img class="arrowLeft" src="./assets/back.svg" alt="Left Arrow"/>';
  arrowLeft.innerHTML = leftImg;
  const thisDay = new Date().toLocaleDateString();
  let date;
  if (todayAlt === thisDay) {
    if (language === 'fi') {
      date = 'Tänään';
    } else {
      date = 'Today';
    }
  } else {
    date = todayAlt;
  }
  const restaurantName = "<h3 class='restaurantName'>" + name + "<br>" + date + "</h3>";
  const arrowRight = document.createElement("div");
  arrowRight.classList.add("resCarouselRight");
  const rightImg =
    '<img class="arrowRight" src="./assets/back.svg" alt="Right Arrow"/>';
  arrowRight.innerHTML = rightImg;
  titleDiv.appendChild(arrowLeft);
  titleDiv.innerHTML += restaurantName;
  titleDiv.appendChild(arrowRight);
  return titleDiv;
};

const changeDay = (direction) => {
  let newDate = new Date(dateVar);
  console.log("NewDate: " + newDate.getDate());
  if (direction === "forward") {
    console.log("Forward");
    newDate.setDate(newDate.getDate() + 1);
  } else {
    console.log("Back");
    newDate.setDate(newDate.getDate() - 1);
  }
  dateVar = newDate;
  todayAlt = newDate.toLocaleDateString();
  console.log("TodayAlt: " + todayAlt);
  today = new Date(newDate).toISOString().split("T")[0];
  getMenu();
};

const refreshDate = () => {
  today = new Date().toISOString().split("T")[0];
  todayAlt = new Date().toLocaleDateString();
  dateVar = new Date();
};

const addResCarouselEventListeners = () => {
  const left = document.querySelector(".resCarouselLeft");
  left.addEventListener("click", () => {
    console.log("arrowLeft");
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(20%, 0%)";
    setTimeout(function () {
      changeDay("backward");
    }, 300);
  });

  const right = document.querySelector(".resCarouselRight");
  right.addEventListener("click", () => {
    console.log("arrowRight");
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(-20%, 0%)";
    setTimeout(function () {
      changeDay("forward");
    }, 300);

  });
};

const isNumeric = (str) => {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

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

const loadHSLData = async (id) => {
  const result = await HSLData.getRidesByStopId(id);
  const stop = result.data.stop;
  const stopElement = document.createElement("div");
  const stopName = document.createElement("h3");
  const stopList = document.createElement("ul");
  stopList.classList.add("stopList");

  stopElement.className = "stop";
  if (language === "fi") {
    stopName.innerHTML = `${stop.name}`;
    stopElement.appendChild(stopName);
  } else {
    stopName.innerHTML = `${stop.name}`;
    stopElement.appendChild(stopName);
  }
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

const NoMenuFoundNotification = (message, name) => {
  console.log("NoMenuFound " + name);
  resContainer.innerHTML = "";
  const titleDiv = createTitleDiv(name);
  const noMenuMessage = `<p>${message}</p>`;
  resContainer.appendChild(titleDiv);
  resContainer.innerHTML += noMenuMessage;
  addResCarouselEventListeners();
};

const getNearestCampus = () => {
  let distances = [];
  getLocation()
    .then((position) => {
      const currentLatitude = position.coords.latitude;
      const currentLongitude = position.coords.longitude;
      for (const restaurant of RestaurantData.restaurants) {
        const distance = getDistance(
          currentLatitude,
          currentLongitude,
          restaurant.lat,
          restaurant.lon,
          "K"
        );
        distances.push(distance);
      }
      const i = distances.indexOf(Math.min(...distances));
      currentCampus = RestaurantData.restaurants[i].name;
      localStorage.setItem('currentCampus', currentCampus);
      console.log("Ready " + currentCampus);
      getMenu();
      getStops();
    })
    .catch((err) => {
      console.error(err.message);
      getMenu();
      getStops();
    });
};

const insertHslHeader = () => {
  const header = document.querySelector('.hslHeader');
  header.innerHTML = '';

  if (language === 'fi') {
    header.innerHTML = 'Aikataulut';
  } if (language === 'en') {
    header.innerHTML = 'Timetables';
  }
};

const getStops = async () => {
  document.querySelector('.hsl-data').innerHTML = '';
  insertHslHeader();
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

const createCampusInfo = (lang, campus) => {
  const data = parseCampusInfo(lang, campus);
  footer.innerHTML = "";
  for (const object of data) {
    const div = document.createElement("div");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    h3.innerHTML = object.title;
    p.innerHTML = object.text;
    div.appendChild(h3);
    div.appendChild(p);
    footer.appendChild(div);
  }
  console.log("CampusInfo: " + data);
};

const updateUi = () => {
  createCampusInfo(language, currentCampus);
  banner.style.backgroundImage = 'url("./assets/' + currentCampus + '.jpg")';
  for (const restaurant of RestaurantData.restaurants) {
    const campusButton = document.querySelector("." + restaurant.name);
    if (!campusButton.classList.contains("campus")) {
      campusButton.classList.add("campus");
    }
    if (campusButton.classList.contains("activeCampus")) {
      campusButton.classList.remove("activeCampus");
    }
    if (restaurant.name === currentCampus) {
      campusButton.classList.remove("campus");
      campusButton.classList.add("activeCampus");
      if (language === "fi") {
        title.innerHTML = restaurant.title_fi;
      } else {
        title.innerHTML = restaurant.title_en;
      }
    }
  }
  let activeLanguageButton;
  let inactiveLanguageButton;
  if (language === "fi") {
    activeLanguageButton = document.querySelector(".fi");
    inactiveLanguageButton = document.querySelector(".en");
  } else {
    activeLanguageButton = document.querySelector(".en");
    inactiveLanguageButton = document.querySelector(".fi");
  }
  activeLanguageButton.classList.remove("notSelectedLanguage");
  activeLanguageButton.classList.add("selectedLanguage");
  inactiveLanguageButton.classList.remove("selectedLanguage");
  inactiveLanguageButton.classList.add("notSelectedLanguage");
};

const renderWeather = async () => {
  for (const restaurant of RestaurantData.restaurants) {
    if (restaurant.name === currentCampus) {
      const weatherData = await getWeatherLatLon(restaurant.lat, restaurant.lon);
      const weatherBox = document.querySelector('.weatherBox');
      const img = document.createElement('img');
      const div = document.createElement('div');
      const text = document.createElement('h3');
      const degrees = document.createElement('h3');
      img.alt = weatherData.weather[0].description;
      div.classList.add('weatherDiv');
      text.classList.add('weatherText');
      degrees.classList.add('weatherDegrees');

      img.src = 'http://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '@2x.png';
      text.innerHTML = weatherData.weather[0].main;
      degrees.innerHTML = Math.round(weatherData.main.temp) + '°C';

      weatherBox.innerHTML = '';
      weatherBox.appendChild(img);
      div.appendChild(text);
      div.appendChild(degrees);
      weatherBox.appendChild(div);
    }
  }
};

const init = () => {
  addBackgroundParallax();
  setTime();
  getMenu();
  getNearestCampus();
  makeSlides(language);
  infoCarouselRefresh();
  renderWeather();

  const refreshStops = setInterval(getStops, 60000);
};

const refresh = () => {
  getMenu();
  getStops();
  makeSlides(language);
  infoCarouselRefresh();
  renderWeather();
};

langFi.addEventListener("click", () => {
  if (language === "en") {
    language = "fi";
    localStorage.setItem('language', language);
    refresh();
  }
});

langEn.addEventListener("click", () => {
  if (language === "fi") {
    language = "en";
    localStorage.setItem('language', language);
    refresh();
  }
});

myyrmaki.addEventListener("click", () => {
  currentCampus = "myyrmaki";
  localStorage.setItem("currentCampus", currentCampus);
  refreshDate();
  refresh();
  if (menuOpened) {
    changeNavBar();
  }
});

karamalmi.addEventListener("click", () => {
  currentCampus = "karamalmi";
  localStorage.setItem("currentCampus", currentCampus);
  refreshDate();
  refresh();
  if (menuOpened) {
    changeNavBar();
  }
});

myllypuro.addEventListener("click", () => {
  currentCampus = "myllypuro";
  localStorage.setItem("currentCampus", currentCampus);
  refreshDate();
  refresh();
  if (menuOpened) {
    changeNavBar();
  }
});

arabia.addEventListener("click", () => {
  currentCampus = "arabia";
  localStorage.setItem("currentCampus", currentCampus);
  refreshDate();
  refresh();
  if (menuOpened) {
    changeNavBar();
  }
});

const changeNavBar = () => {
  let x = document.querySelector('.navbar');
  let campus = document.querySelector('.campuses');
  if (x.className === "navbar") {
    x.className += " responsive";
    campus.style.height = '230px';
    menuOpened = true;
  } else {
    x.className = "navbar";
    campus.style.height = '0px';
    menuOpened = false;
  }
};

const navIcon = document.querySelector(".icon");
navIcon.addEventListener("click", () => {
  console.log("Click");
  changeNavBar();
});

init();
