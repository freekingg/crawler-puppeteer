import { getLocalStorage, getCookie } from '../../lib/tg-util';

const login = async (page, opts) => {
  await page.goto('https://yesonline.yesbank.co.in/index.html?module=login', { waitUntil: 'networkidle2' });
  // await page.goto("https://bot.sannysoft.com/",{ waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'example1.png', fullPage: true });

  await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  await page.waitFor('#login_password', { visible: true });
  await page.type('#login_username', opts.account);
  await page.type('#login_password', opts.pwd);

  await page.waitForTimeout(1000);
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#login-button')]);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'example2.png' });

  let localStorage = await getLocalStorage(page);
  let cookie = await getCookie(page);

  let authData = {
    localStorage,
    cookie
  };
  return authData;

  // if (!opts.isAuthenticated) {
  //   let localStorage = await getLocalStorage(page);
  //   let cookie = await getCookie(page);

  //   let authData = {
  //     localStorage,
  //     cookie
  //   };
  //   return authData;
  // }

  // await page.waitFor('input#username', { visible: true });
  // await page.waitFor('input#password', { visible: true });
  // await page.type('input#username', opts.account);
  // await page.type('input#password', opts.pwd);

  // await Promise.all([page.waitForNavigation(), page.click('#signIn .continue-btn')]);

  // let localStorage = await getLocalStorage(page);
  // let cookie = await getCookie(page);

  // let authData = {
  //   localStorage,
  //   cookie
  // };
  // await page.close();
  // return authData;
};

export default async function(browser, opts) {
  const page = await browser.newPage();
  // const headers = {
  //   'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
  // };
  // await page.setExtraHTTPHeaders(headers);
  // await page.goto(opts.url);
  // let authData = await login(page, opts);
  // return authData;

  await page.goto('https://yesonline.yesbank.co.in/index.html?module=login', { waitUntil: 'networkidle2' });
  // await page.goto("https://bot.sannysoft.com/",{ waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'example1.png', fullPage: true });

  await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  await page.waitFor('#login_password', { visible: true });
  await page.type('#login_username input', opts.account);
  await page.type('#login_password input', opts.pwd);

  await page.waitForTimeout(1000);
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#login-button')]);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'example2.png' });

  // await page.waitForFunction(() => {
  //   const username = document.querySelectorAll('button.oj-component-initnode')
  //   return username[0]['value'].length == 6;
  // }, { timeout: 120000 });
  await page.waitForTimeout(30000);
  // await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.button-container .action-button-primary button:first-child')]);
  await page.waitForTimeout(3000);
  let localStorage = await getLocalStorage(page);
  let cookie = await getCookie(page);

  let authData = {
    localStorage,
    cookie
  };
  return authData;
}
export { login };
