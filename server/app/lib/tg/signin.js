import path from "path";
const signin = async (page, { url, account }) => {

  let screenshotTimer = null

  let screenPath = path.join(__dirname, '../../../assets/screenshot')
 
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);
  await page.waitFor(3000);
  await page.waitForSelector(
    "#auth-pages > .scrollable > .tabs-container > .page-signQR  .qr-canvas",
    { visible: true }
  );
  // console.log("二维码展示出来了");
  await page.waitFor(2000);
 
  // 生成截图
  await page.screenshot({ path: `${screenPath}/${account}.png`, clip: { x: 820, y: 130, width: 280, height: 280 } });
  
  // 因为二维码会一直变，所以每15秒截图一次
  screenshotTimer = setInterval(() => {
    console.log('15秒截图一次')
    page.screenshot({ path: `${screenPath}/${account}.png`, clip: { x: 820, y: 130, width: 280, height: 280 } });
  }, 15000);

  // 等待扫码登录中
  try {
    await page.waitForSelector("#page-chats", { visible: true, timeout: 120000 });
    console.log("登录了");
    clearInterval(screenshotTimer)
  } catch (error) {
    console.log('等待登录出错了,', error);
    clearInterval(screenshotTimer)
    return false
  }

  //  获取 localStorage
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
 

  // 获取 cookies
  const cookies = await page.cookies()
  let authData = {
    localStorageData,
    cookies
  }
  return authData;
};

export default signin;
