import {getMenus} from "./network";
const sodexoAddress = 'https://www.sodexo.fi/ruokalistat/output/daily_json';
let menu = [];

const parseSodexoMenu = (data, lang) => {
  console.log('SodexoData: ' + data.courses);
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

const getDailyMenu = async (restaurantId, lang, date) => {
  let menuData;
  try {
    menuData = await getMenus(`${sodexoAddress}/${restaurantId}/${date}`);
  } catch (error) {
    throw new Error(error.message);
  }
  const parsedMenu = parseSodexoMenu(menuData, lang);
  console.log('Parsed: ' + JSON.stringify(parsedMenu));
  return parsedMenu;
};

const SodexoData = {getDailyMenu};
export default SodexoData;
