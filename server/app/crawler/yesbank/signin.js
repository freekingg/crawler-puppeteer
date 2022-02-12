import { getLocalStorage, getCookie, rdGet, rdRemove } from '../../lib/tg-util';

const login = async (page, opts) => {
  console.log('opts', opts);
  await page.goto('https://yesonline.yesbank.co.in/index.html?module=login');

  await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  // await page.screenshot({ path: 'login.png', fullPage: true });
  await page.waitFor('#login_password', { visible: true });
  await page.type('#login_username input', opts.account);
  await page.type('#login_password input', opts.pwd);

  // 跳转opt验证页面
  await page.waitForTimeout(1000);
  await Promise.all([page.waitForNavigation(), page.click('#login-button')]);
  await page.waitForTimeout(3000);

  let getCodeCount = 0;
  // 获取登录验证码
  let memberCode = 'member:code:1486252900431376386';
  if (opts.extra) {
    let extra = JSON.parse(opts.extra);
    if (!extra.memberId) {
      return Promise.reject(new Error('未配置账户id--memberId'));
    }
    memberCode = `member:code:${extra.memberId}`;
  }

  let timer = null;
  const getOptCodeHandle = () => {
    clearTimeout(timer);
    return new Promise(resolve => {
      timer = setTimeout(() => {
        rdGet(memberCode).then(code => {
          resolve(code);
        });
      }, 3000);
    }).then(res => {
      // 此处接收的res是上面resolve的result,
      if (res) {
        console.log('获取到otp', res);
        return Promise.resolve(res);
      } else {
        console.log('没有获取到otp,继续获取');
        return getOptCodeHandle;
      }
    });
  };

  await page.waitFor('#otp input', { visible: true });
  await page.waitForTimeout(1000);
  // await page.screenshot({ path: 'opt.png' });
  let code = await getOptCodeHandle();
  let _code = code.replace(/[^0-9]/gi, '');

  // 移除redis内验证码
  rdRemove(memberCode);

  if (!code) {
    console.log('code: ', code);
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

  let authData = {
    localStorage,
    cookie
  };
  return authData;
};

export default async function(browser, opts) {
  console.log('opts', opts);
  let authData = {};
  return authData;
}
export { login };
