const signin = async ({ page, data }) => {
  let { url, authData } = data;
  await page.goto(url);
  await page.waitFor(3000);

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.evaluate((authData) => {
    let { localStorageData } = authData;
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
  //  获取 聊天列表
  const chatList = await page.evaluate(() => {
    let chats = document.querySelectorAll("#chatlist-container .chatlist-chat");
    console.log("chats: ", chats.length);
    let data = [];
    for (const item of chats) {
      let title = item.querySelector(".peer-title").innerText;
      let chatId = item.querySelector(".peer-title").dataset.peerId;
      data.push({
        title,
        chatId,
      });
    }
    return data;
  });
  return chatList;
};

export default signin;
