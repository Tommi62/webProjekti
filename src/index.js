import { getLocation, getDistance } from "./modules/calculate-distance";
import { parseCampusInfo } from "./modules/info-data";
import { renderWeather } from './modules/weather-data';
import { handleTouchStart, handleTouchMove } from './modules/swiper';
import RestaurantData from './modules/restaurant-info';
import { makeSlides, infoCarouselRefresh } from './modules/slide-controller';
import { addBackgroundParallax } from './modules/background-parallax';
import { getStops, setTime} from './modules/hsl-controller';


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

let menuOpened = false;

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

/**
 * Retrieves restaurant's menu (Sodexo or Fazer depending currentCampus' value) and calls function which renders it.
 */
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

/**
 * Is called when that day's menu is empty.
 * Checks site's language, creates message and calls function which renders that message.
 * @param {object} restaurant - Selected campus' restaurant-object that has empty menu.
 */
const noMenuError = (restaurant) => {
  let message;
  if (language === "fi") {
    message = "Tälle päivälle ei löydetty ruokalistaa.";
  } else {
    message = "No menu was found for today.";
  }
  NoMenuFoundNotification(message, restaurant.displayName);
};

/**
 * Creates a restaurant menu box which tells you that there is no menu for this day.
 * @param {string} message - Message to be shown in menu box if the menu is empty. Can be either finnish or english.
 * @param {string} name - The name of the restaurant.
 */
const NoMenuFoundNotification = (message, name) => {
  resContainer.innerHTML = "";
  const titleDiv = createTitleDiv(name);
  const noMenuMessage = `<p>${message}</p>`;
  resContainer.appendChild(titleDiv);
  resContainer.innerHTML += noMenuMessage;
  addResCarouselEventListeners();
};

/**
 * Creates a box for Fazer menu and renders dishes and price list into it.
 * @param {array} data - Array that includes dishes.
 * @param {string} name - The name of the restaurant.
 */
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
  const priceContainer = createFazerPriceContainer();
  content.appendChild(ul);
  content.appendChild(priceContainer);
  resContainer.appendChild(titleDiv);
  resContainer.appendChild(content);
  addResCarouselEventListeners();
};

/**
 * Creates a box for Sodexo menu and renders dishes, categories, prices and codes into it.
 * @param {array} data - Array that includes dishes, categories, prices and codes.
 * @param {string} name - The name of the restaurant.
 */
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

/**
 * Creates a price list for Fazer menu.
 * @returns {HTMLElement} - Price list div.
 */
const createFazerPriceContainer = () => {
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

/**
 * Translates Sodexo menu's category names into english.
 * @param {string} name - One of the category names of the Sodexo menu.
 * @returns {string} - Translated name (If translation was not found returns the same parameter)
 */
const translateCategoryName = (name) => {
  if (RestaurantData.menuTranslator.hasOwnProperty(name)) {
    const translated = RestaurantData.menuTranslator[name];
    return translated;
  } else {
    return name;
  }
};

/**
 * Removes slashes and some empty spaces of the price text when screen width is under 500px.
 * @param {mediaQuery} e - Matches if the screen width is under 500px.
 * @param {string} price - Sodexo menu's prices.
 * @returns {string} - Modified price text (Or the parameter unchanged)
 */
const handleChange = (e, price) => {
  if (e.matches) {
    let modPrice = price.replace(/\//g, '');
    let regex = /\s+([€])/g;
    return modPrice.replace(regex, '€');
  } else {
    return price;
  }
};

mediaQuery.addListener(handleChange);

/**
 * Creates a title div for the restaurant menu box.
 * @param {string} name - The name of the restaurant.
 * @returns {HTMLElement} - The div whichs includes the restaurant name, date and the arrow divs to change a day.
 */
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

/**
 *Changes the date variables when the menu box's arrow divs are clicked.
 * @param {string} direction - Forward or Backward.
 */
const changeDay = (direction) => {
  let newDate = new Date(dateVar);
  if (direction === "forward") {
    newDate.setDate(newDate.getDate() + 1);
  } else {
    newDate.setDate(newDate.getDate() - 1);
  }
  dateVar = newDate;
  todayAlt = newDate.toLocaleDateString();
  today = new Date(newDate).toISOString().split("T")[0];
  getMenu();
};

/**
 * Changes the values of the date variables back to today's date.
 */
const refreshDate = () => {
  today = new Date().toISOString().split("T")[0];
  todayAlt = new Date().toLocaleDateString();
  dateVar = new Date();
};

/**
 * Adds click eventlisteners to the arrow divs of restaurant menu box.
 */
const addResCarouselEventListeners = () => {
  const left = document.querySelector(".resCarouselLeft");
  left.addEventListener("click", () => {
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(20%, 0%)";
    setTimeout(function () {
      changeDay("backward");
    }, 300);
  });

  const right = document.querySelector(".resCarouselRight");
  right.addEventListener("click", () => {
    let title = document.querySelector('.restaurantName');
    title.style.opacity = 0;
    title.style.transform = "translate(-20%, 0%)";
    setTimeout(function () {
      changeDay("forward");
    }, 300);

  });
};

/**
 * Changes menu day on a swipe in the restaurant element and makes a subtle swipe transition.
 *
 * @param {event} evt - swipe event
 */
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

/**
 * If the user allows the app to use the device's gps, this function checks which campus is closest to user's
 * current location and puts the name of that campus to the currentCampus variable. After that getMenu and getStops
 * functions are called.
 * If the user does not allow gps, only getMenu and getStops functions are called.
 */
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
      getMenu();
      getStops(language, currentCampus);
    })
    .catch((err) => {
      console.error(err.message);
      getMenu();
      getStops(language, currentCampus);
    });
};


/**
 * Retrieves information of the current campus and puts that into footer.
 * @param {string} lang - Current language of the app; fi or en.
 * @param {string} campus - The campus that is selected (The value of currentCampus).
 */
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
};

/**
 * Changes the background image and the title of the app depending on which campus is selected.
 * Also changes style of the button of that campus.
 */
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

/**
 * Initializes the web page
 */
const init = () => {
  addBackgroundParallax();
  setTime();
  getMenu();
  getNearestCampus();
  makeSlides(language);
  infoCarouselRefresh();
  renderWeather(currentCampus);

  //const refreshStops = setInterval(getStops(language, currentCampus), 60000);
};

/**
 * Refreshes the web page content
 */
const refresh = () => {
  getMenu();
  getStops(language, currentCampus);
  makeSlides(language);
  infoCarouselRefresh();
  renderWeather(currentCampus);
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

/**
 * Opens and closes the hamburger menu.
 */
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
  changeNavBar();
});

init();
