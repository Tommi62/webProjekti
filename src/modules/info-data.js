const info = require('../assets/info.json');

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

const InfoData = {parseInfo};
export default InfoData;
