export default async function(browser, opts) {
  // try {
  const page = browser;
  // 添加headers
  const headers = {
    'Accept-Encoding': 'gzip'
  };

  // 设置headers
  await page.setExtraHTTPHeaders(headers);
  await page.goto(opts.url);

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
