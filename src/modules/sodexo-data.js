import {getMenus} from "./network";
const sodexoAddress = 'https://www.sodexo.fi/ruokalistat/output/daily_json';
let menu = [];

/**
 * Parses data from API into objects and those objects into array.
 * @param {object} data - An object that includes menu data.
 * @param {string} lang - Tells in which language should title be rendered; fi or en.
 * @returns {array} - Include objects that include information about dishes.
 */
const parseSodexoMenu = (data, lang) => {
  const courses = Object.values(data.courses);
  menu = [];
  for(const course of courses) {
    let menuItem = {};
    menuItem.category = course.category;
    if(lang === 'fi'){
      menuItem.title = course.title_fi;
    } else{
      menuItem.title = course.title_en;
    }
    menuItem.price = course.price;
    menuItem.code = course.dietcodes;
    menu.push(menuItem);
  }
    return menu;
};

/**
 * Retrieves the menu of desired day and restaurant from Sodexo API and calls parseSodexoMenu function using the menu
 * and desired language as parameter.
 * @param {number} restaurantId - ID of the restaurant.
 * @param {string} lang - Current language of the app; fi or en.
 * @param {date} date - The day the menu is desired.
 * @returns {array} - An array which includes objects that iclude dishes' name, category, price and code.
 */
const getDailyMenu = async (restaurantId, lang, date) => {
  let menuData;
  try {
    menuData = await getMenus(`${sodexoAddress}/${restaurantId}/${date}`);
  } catch (error) {
    throw new Error(error.message);
  }
  const parsedMenu = parseSodexoMenu(menuData, lang);
  return parsedMenu;
};

const SodexoData = {getDailyMenu};
export default SodexoData;
