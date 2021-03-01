const info = require('../assets/info.json');
const campusInfo = require('../assets/campus-info.json');

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

export {parseInfo, parseCampusInfo};
