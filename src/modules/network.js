/**
 * Fetches a menu from the inputted address.
 *
 * @param {url} address - menu url address
 * @returns {json} - menu object
 */
const getMenus = async (address) => {
  let response;
  try {
    response = await fetch(address);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('getMenu error', error.message);
  }
  let menu = await response.json();
  return menu;
};

/**
 * Fetches the weather from the inputted address.
 *
 * @param {url} address - weather url address
 * @returns {json} - weather object
 */
const getWeather = async (address) => {
  let response;
  try {
    response = await fetch(address);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('getWeather error', error.message);
  }
  let weather = await response.json();
  return weather;
};

/**
 * Fetches HSL stopdata.
 *
 * @param {url} url
 * @param {contentType} contentType - 'application/graphql'
 * @param {object} body - body query
 * @param {boolean} useProxy
 * @returns
 */
const fetchPostJson = async (url, contentType, body, useProxy = false) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': contentType
    },
    body: body,
  };
  let response;
  try {
    response = await fetch(`${useProxy ? networkProxyUrl : ''}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('network fetchPost error', error.message);
  }
  const responseJson = await response.json();
  return responseJson;
};

  export {getMenus, fetchPostJson, getWeather};
