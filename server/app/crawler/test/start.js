export default async function(browser, opts) {
  try {
    const page = await browser.newPage()
    await page.goto(opts.url);
    await page.close();
    return {
      status: true
    }
  } catch (error) {
    console.log('任务出错', error);
    return {
      status: false,
      error: String(error)
    }
  }
}
