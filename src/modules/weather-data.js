import {getWeather} from "./network";
const weatherAddress = 'https://api.openweathermap.org/data/2.5/weather';
const key = '56684b208668c1335175e8c8b53b7f69';

const getWeatherLatLon = async (lat, lon) => {
  let weatherData;
  try {
    weatherData = await getWeather(`${weatherAddress}?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
  } catch (error) {
    throw new Error(error.message);
  }
  return weatherData;
};

export {getWeatherLatLon};
