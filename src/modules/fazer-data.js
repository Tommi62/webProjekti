import {fazerProxyUrl} from "./settings";
import {getMenus} from "./network";

const fazerAddressFi = `${fazerProxyUrl}/api/restaurant/menu/week?language=fi&restaurantPageId=`;
const fazerAddressEn = `${fazerProxyUrl}/api/restaurant/menu/week?language=en&restaurantPageId=`;

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

const getDailyMenu = async (restaurantId, lang, date) => {
  let dayOfWeek = new Date().getDay();
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
