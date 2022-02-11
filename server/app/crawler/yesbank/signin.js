import { getLocalStorage, getCookie, rdGet, rdRemove } from '../../lib/tg-util';

const login = async (page, opts) => {
  await page.goto('https://yesonline.yesbank.co.in/index.html?module=login');

  await page.screenshot({ path: 'login.png', fullPage: true });

  await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  await page.waitFor('#login_password', { visible: true });
  await page.type('#login_username input', opts.account);
  await page.type('#login_password input', opts.pwd);

  // 跳转opt验证页面
  await page.waitForTimeout(1000);
  await Promise.all([page.waitForNavigation(), page.click('#login-button')]);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'opt.png' });

  let getCodeCount = 0;

  // 获取登录验证码
  let memberCode = 'member:code:1486252900431376386';
  const getOptCodeHandle = () => {
    return new Promise(resolve => {
      rdGet(memberCode)
        .then(code => {
          console.log('获取到otp', code, code.length);
          resolve(code);
        })
        .catch(() => {
          console.log('未获取到otp，继续获取');
          getCodeCount++;
          if (getCodeCount > 20) {
            console.log(`获取otp-${getCodeCount}次 登录验证码异常，`);
            resolve();
            return;
          }
          getOptCodeHandle();
        });
    });
  };

  await page.waitFor('#otp input', { visible: true });
  await page.waitForTimeout(1000);
  let code = await getOptCodeHandle();
  let _code = code.replace(/[^0-9]/gi, '');
  if (!code) {
    return Promise.reject(new Error('获取otp登录验证码出现异常'));
  }
  await page.click('#otp input');
  await page.type('#otp input', _code, { delay: 300 });
  await page.waitForTimeout(1000);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('.button-container .action-button-primary button:first-child')
  ]);
  await page.waitForTimeout(1000);

  let localStorage = await getLocalStorage(page);
  let cookie = await getCookie(page);

  // 移除redis内验证码
  rdRemove(memberCode);

  let authData = {
    localStorage,
    cookie
  };
  return authData;
};

export default async function(browser, opts) {
  const page = await browser.newPage();
  const headers = {
    'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
  };
  await page.setExtraHTTPHeaders(headers);
  await page.goto(opts.url);

  await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  await page.waitFor('#login_password', { visible: true });
  await page.type('#login_username input', opts.account);
  await page.type('#login_password input', opts.pwd);

  await page.waitForTimeout(1000);
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#login-button')]);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'example2.png' });

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
