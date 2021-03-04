const url = 'https://api.openweathermap.org/data/2.5/weather';
const key = '56684b208668c1335175e8c8b53b7f69';
import { getWeather } from "./network";


const getWeatherLatLon = async (lat, lon) => {
  let result;
  try {
    result = await getWeather(url + `?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
  } catch (error) {
    throw new Error(error.message);
  }
  return result;
};

export { getWeatherLatLon };
