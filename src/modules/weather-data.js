import {getWeather} from "./network";
import RestaurantData from '../modules/restaurant-info';

const weatherAddress = 'https://api.openweathermap.org/data/2.5/weather';
const key = '56684b208668c1335175e8c8b53b7f69';

/**
 * Gets the weather from coordinates in metric units.
 *
 * @param {number} lat - latitude
 * @param {number} lon - longitude
 * @returns weather object
 */
const getWeatherLatLon = async (lat, lon) => {
  let weatherData;
  try {
    weatherData = await getWeather(`${weatherAddress}?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
  } catch (error) {
    throw new Error(error.message);
  }
  return weatherData;
};

/**
 * Renders the weather element to the HTML page
 *
 * @param {string} currentCampus - Current loaded campus
 */
const renderWeather = async (currentCampus) => {
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

export {renderWeather};
