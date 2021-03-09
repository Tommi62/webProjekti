import {fazerProxyUrl} from "./settings";
import {getMenus} from "./network";

const fazerAddressFi = `${fazerProxyUrl}/api/restaurant/menu/week?language=fi&restaurantPageId=`;
const fazerAddressEn = `${fazerProxyUrl}/api/restaurant/menu/week?language=en&restaurantPageId=`;

/**
 * Takes dish names and diets from setMenus and puts them into dailyMenu-array.
 * @param {object} setMenus - An object retrieved from API. Includes arrays that include information about dishes.
 * @returns {array} - An array that includes dish names and diets.
 */
const parseFazerMenu = (setMenus) => {
  let dailyMenu = setMenus.map(setMenu => {
    let mealName = setMenu.Name;
    let dishes = setMenu.Meals.map(dish => {
      return `${dish.Name} (${dish.Diets.join(', ')})`;
    });
    return mealName ? `${mealName}: ${dishes.join(', ')}` : dishes.join(', ');
  });
  return dailyMenu;
};

/**
 * Retrieves the menu of the desired day and language from Fazer API and uses it as parameter when calling ParseFazerMenu function.
 * @param {number} restaurantId - ID of the restaurant.
 * @param {string} lang - Current language of the app; fi or en.
 * @param {date} date - The day the menu is desired.
 * @returns {function} - Function which returns dishes.
 */
const getDailyMenu = async (restaurantId, lang, date) => {
  let dayOfWeek = new Date(date).getDay();
  dayOfWeek -= 1;
  if (dayOfWeek === -1) {
    dayOfWeek = 6;
  }
  let menuData;
  try {
    menuData = await getMenus(`${lang == 'fi' ? fazerAddressFi:fazerAddressEn}${restaurantId}&weekDate=${date}`);
  } catch (error) {
    throw new Error(error.message);
  }
  return parseFazerMenu(menuData.LunchMenus[dayOfWeek].SetMenus);
};

const FazerData = {getDailyMenu};
export default FazerData;
