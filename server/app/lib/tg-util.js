import redis from '../lib/redis';
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
  const cookies = await page.cookies();
  return cookies;
}

const rdGet = key => {
  return new Promise((resolve, reject) => {
    redis
      .get(key)
      .then(result => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('rdGet获取出现异常'));
        }
      })
      .catch(err => {
        console.log('err: ', err);
        reject(err);
      });
  });
};

const rdRemove = key => {
  return new Promise((resolve, reject) => {
    redis
      .del(key)
      .then(() => {
        console.log(`${key}移除成功`);
      })
      .catch(err => {
        console.log('err: 移除失败', err);
        reject(err);
      });
  });
};

export { getLocalStorage, getCookie, rdGet, rdRemove };
