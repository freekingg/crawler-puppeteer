export default async function(browser, opts) {
  // try {
  const page = await browser.newPage();
  // 添加headers
  const headers = {
    'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
  };

  // 设置headers
  await page.setExtraHTTPHeaders(headers);

  await page.goto(opts.url);
  await page.close();
  return {
    status: true
  };
}
