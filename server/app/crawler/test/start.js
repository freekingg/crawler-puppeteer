export default async function(browser, opts) {
  const page = browser;

  // 流水页面
  await page.goto('https://yesonline.yesbank.co.in/pages/home.html?module=YPONI&page=account-statement');

  // await page.waitFor('#login_username', { visible: true, timeout: 30000 });
  // await page.waitFor('#login_password', { visible: true });
  // await page.type('#login_username', opts.account);
  // await page.type('#login_password', opts.pwd);

  // await page.click('#login-button')
  // await page.waitForTimeout(5000);
  // await page.screenshot({ path: 'screenshot222.png' });
  // page.close()
  return false
}
