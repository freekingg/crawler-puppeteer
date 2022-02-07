import { getLocalStorage, getCookie } from '../../lib/tg-util';

const login = async (page, opts) => {
  if (!opts.isAuthenticated) {
    let localStorage = await getLocalStorage(page);
    let cookie = await getCookie(page);

    let authData = {
      localStorage,
      cookie
    };
    return authData;
  }

  await page.waitFor('input#username', { visible: true });
  await page.waitFor('input#password', { visible: true });
  await page.type('input#username', opts.account);
  await page.type('input#password', opts.pwd);

  await Promise.all([page.waitForNavigation(), page.click('#signIn .continue-btn')]);

  let localStorage = await getLocalStorage(page);
  let cookie = await getCookie(page);

  let authData = {
    localStorage,
    cookie
  };
  await page.close();
  return authData;
};

export default async function(browser, opts) {
  const page = await browser.newPage();
  const headers = {
    'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
  };
  await page.setExtraHTTPHeaders(headers);
  await page.goto(opts.url);
  let authData = await login(page, opts);
  return authData;
}
export { login };
