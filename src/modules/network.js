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

const fetchPostJson = async (url, contentType, body, useProxy = false) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': contentType
    },
    body: body,
  };
  let response;
  try {
    response = await fetch(`${useProxy ? networkProxyUrl : ''}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('network fetchPost error', error.message);
  }
  const responseJson = await response.json();
  return responseJson;
};

  export {getMenus, fetchPostJson};
