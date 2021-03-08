import SodexoData from "./sodexo-data";
import FazerData from "./fazer-data";

const restaurants = [
  {
    title_fi: "Myyrmäen kampus",
    title_en: "Myyrmäki campus",
    displayName: "Sodexo Myyrmäki",
    name: "myyrmaki",
    id: 152,
    lat: 60.2586191,
    lon: 24.8432836,
    type: SodexoData,
  },
  {
    title_fi: "Karamalmin kampus",
    title_en: "Karamalmi campus",
    displayName: "Fazer Food & Co Karaportti",
    name: "karamalmi",
    id: 270540,
    lat: 60.2238794,
    lon: 24.7559603,
    type: FazerData,
  },
  {
    title_fi: "Myllypuron kampus",
    title_en: "Myllypuro campus",
    displayName: "Sodexo Myllypuro",
    name: "myllypuro",
    id: 158,
    lat: 60.2236145,
    lon: 25.0761622,
    type: SodexoData,
  },
  {
    title_fi: "Arabian kampus",
    title_en: "Arabia campus",
    displayName: "Sodexo Arabia",
    name: "arabia",
    id: 158,
    lat: 60.2103774,
    lon: 24.9788837,
    type: SodexoData,
  },
];

const fazerPrices = [
  {
    group_fi: 'Opiskelijat',
    group_en: 'Students',
    prices: '1,90€/2,70€/5,71€'
  },
  {
    group_fi: 'Metropolian henkilökunta',
    group_en: 'Metropolia staff',
    prices: '4,70€/6,10€/7,20€'
  },
  {
    group_fi: 'Muut',
    group_en: 'Other',
    prices: '5,70€/7,15€/9,20€'
  },
  {
    group_fi: 'Jälkiruokakahvi',
    group_en: 'Dessert coffee',
    prices: '1,10€'
  },
  {
    group_fi: 'Päivän jälkiruoka',
    group_en: 'Dessert of the day',
    prices: '1,10€'
  },
];

const menuTranslator = {
  Kotiruoka: 'Home cooking',
  Kasvisruoka: 'Vegetarian food',
  Leipälounas: 'Bread lunch',
  Jälkiruoka: 'Dessert',
  ['Kotiruoka 1']: 'Home cooking 1',
  ['Kotiruoka 2']: 'Home cooking 2',
};

const RestaurantData = {restaurants, fazerPrices, menuTranslator, SodexoData, FazerData};
export default RestaurantData;
