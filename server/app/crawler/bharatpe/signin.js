import { getLocalStorage, getCookie } from '../../lib/tg-util';
export default async function(browser, opts) {
  const page = await browser.newPage();
  await page.goto(opts.url);

  console.log('url', page.url());

  // 相等代表已登录 直接获取authData
  if (page.url() === opts.url) {
    let localStorage = await getLocalStorage(page);
    let cookie = await getCookie(page);

    let authData = {
      localStorage,
      cookie
    };
    await page.close();
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
}
