import {getLocalStorage, getCookie} from "../../lib/tg-util";
export default async function(browser, opts) {
  const page = await browser.newPage()
  await page.goto(opts.url);

  await page.waitFor("input[name=account]", { visible: true });
  await page.waitFor("input[name=password]", { visible: true });
  await page.evaluate(
    () => (document.querySelector("input[name=account]").value = "")
  );
  await page.evaluate(
    () => (document.querySelector("input[name=password]").value = "")
  );

  await page.type("input[name=account]", opts.account);
  await page.type("input[type=password]", opts.pwd);

  await Promise.all([
    page.waitForNavigation(),
    page.click(".btn.btn-success.btn-lg")
  ])

  let localStorage = await getLocalStorage(page)
  let cookie = await getCookie(page)

  let authData = {
    localStorage,
    cookie
  }
  await page.close();
  return authData;
}
