const getMenus = async (address) => {
  let response;
  try {
    response = await fetch(address);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('getMenu error', error.message);
  }
  let menu = await response.json();
  return menu;
};

  export {getMenus};
