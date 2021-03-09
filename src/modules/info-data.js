
//const info = require('../assets/json/info.json');
const campusInfo = require('../assets/json/campus-info.json');
const slideAmount = 15;

/* TEXT SLIDES

const parseInfo = (lang) => {
  let infoList = [];
  for (const infoObject of info.info) {
    if (lang === "fi") {
      const dataFi = {
        title: infoObject.title_fi,
        text: infoObject.text_fi
      };
      infoList.push(dataFi);
    }
    if (lang === "en") {
      const dataEn = {
        title: infoObject.title_en,
        text: infoObject.text_en
      };
      infoList.push(dataEn);
    }
  }
  return infoList;
};
*/

/**
 * Makes a list out of Powerpoint slide images to be used in the info carousel.
 * Use the 'en' and 'fi' folders for slides and adjust slideAmount when needed.
 *
 * @param {string} lang - language
 * @returns array - infoslides in an array
 */
const parseImgs = (lang) => {
  let infoList = [];
  for (let i = 1; i <= slideAmount; i++) {
    infoList.push("./assets/slides/" + lang + "/" + i + ".png");
  }
  return infoList;
};

/**
 * Retrieves campus info data from campus-info.json and parses it into array and sends it to whoever called
 * this function.
 * @param {string} lang - Language in which data is desired; fi or en.
 * @param {string} campusName - The name of the campus which data is desired.
 * @returns {array} - Includes campus' info data.
 */
const parseCampusInfo = (lang, campusName) => {
  let infoList = [];
  for (const infoObject of campusInfo.info) {
    if(infoObject.name === campusName){
      for(const data of infoObject.data){
        if (lang === "fi") {
          const dataFi = {
            title: data.title_fi,
            text: data.text_fi
          };
          infoList.push(dataFi);
        }
        if (lang === "en") {
          const dataEn = {
            title: data.title_en,
            text: data.text_en
          };
          infoList.push(dataEn);
        }
      }
    }
  }
    return infoList;
};

//export {parseInfo, parseCampusInfo};
export {parseImgs, parseCampusInfo};
