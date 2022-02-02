export default async function(browser, opts) {
  // try {
  const page = browser;
  // 添加headers
  const headers = {
    'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
  };

  // 设置headers
  await page.setExtraHTTPHeaders(headers);
  await page.goto(opts.url);
  // await page.close();
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'screenshot.png' });
  return {
    status: true
  };
}
