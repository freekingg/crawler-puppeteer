async function getLocalStorage(page) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
}

async function getCookie(page) {
  const cookies = await page.cookies()
  return cookies;
}

export { getLocalStorage, getCookie };
