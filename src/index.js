import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';

const menuContainer = document.querySelector('.restaurant');
const restaurants = [{
  displayName: 'Myyrmäen Sodexo',
  name: 'myyrmaki',
  id: 152,
  type: SodexoData
}, {
  displayName: 'Karaportin Fazer Food & Co',
  name: 'karamalmi',
  id: 270540,
  type: FazerData
}, {
  displayName: 'Myllypuron Sodexo',
  name: 'myllypuro',
  id: 158,
  type: SodexoData
}, {
  displayName: 'Arabian Sodexo',
  name: 'arabia',
  id: 158,
  type: SodexoData
}];

const today = new Date().toISOString().split('T')[0];
let currentCampus = 'myllypuro';
let language = 'fi';

const getMenu = async () =>{
  for (const restaurant of restaurants) {
    if(restaurant.name === currentCampus){
      try {
          const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, language, today);
          renderMenu(parsedMenu, restaurant.displayName);

      } catch (error) {
        console.error(error);
        let message;
        if(language === 'fi'){
          message = 'Tälle päivälle ei löydetty ruokalistaa.';
        } else{
          message = 'No menu was found for today.';
        }
        NoMenuFoundNotification(message, restaurant.displayName);
      }
    }
  }
};

const renderMenu = (data, name) => {
  menuContainer.innerHTML = '';
  const restaurantName = '<h3>' + name + '</h3>';
  const ul = document.createElement('ul');
  for (const item of data) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  menuContainer.innerHTML += restaurantName;
  menuContainer.appendChild(ul);
};

const NoMenuFoundNotification = (message, name) => {
  const restaurantName = '<h3>' + name + '</h3>';
  const noMenuMessage = `<p>${message}</p>`;
  menuContainer.innerHTML += restaurantName;
  menuContainer.innerHTML += noMenuMessage;
};

getMenu();
