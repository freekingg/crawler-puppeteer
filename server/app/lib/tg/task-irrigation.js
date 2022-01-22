const irrigation = async ({ page, data }) => {
  let { url, authData, contentData } = data;
  await page.goto(url);
  await page.waitFor(3000);

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.evaluate((authData) => {
    let _authData = JSON.parse(authData);
    let { localStorageData } = _authData;
    Object.keys(localStorageData).forEach(function(key) {
      localStorage.setItem(key, localStorageData[key]);
    });
  }, authData);

  await page.goto(url);

  // 等待登录中
  try {
    await page.waitForSelector("#page-chats", {
      visible: true,
      timeout: 120000,
    });
    console.log("登录了");
  } catch (error) {
    console.log("等待登录出错了,", error);
    return false;
  }

  await page.waitForSelector(".chatlist-top .chatlist .chatlist-chat");

  try {
    let chats = await page.$$("#chatlist-container .chatlist-chat");
    for (const iterator of chats) {
      await iterator.click();
      await page.waitFor(1500);
      // 发消息函数
      await page.type(".input-message-input", contentData);
      let sendBtn = await page.$(".chat-input .btn-send-container");
      await sendBtn.click();
      await page.waitFor(1500);
    }
  } catch (error) {
    return false;
  }
  return true;
};

export default irrigation;
