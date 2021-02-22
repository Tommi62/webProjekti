import {getMenus} from "./network";
const sodexoAddress = 'https://www.sodexo.fi/ruokalistat/output/daily_json';
let coursesEn = [];
let coursesFi = [];

const parseSodexoMenu = (data, lang) => {
  console.log('SodexoData: ' + data.courses);
  const courses = Object.values(data.courses);
  coursesEn = [];
  coursesFi = [];
  for(const course of courses) {
    coursesEn.push(course.title_en);
    coursesFi.push(course.title_fi);
  }
  if(lang === 'fi'){
    return coursesFi;
  }else{
    return coursesEn;
  }
};

const getDailyMenu = async (restaurantId, lang, date) => {
  let menuData;
  try {
    menuData = await getMenus(`${sodexoAddress}/${restaurantId}/${date}`);
    await console.log('Menu: ' + JSON.stringify(menuData));
  } catch (error) {
    throw new Error(error.message);
  }
  const parsedMenu = parseSodexoMenu(menuData, lang);
  return parsedMenu;
};

const SodexoData = {getDailyMenu};
export default SodexoData;
