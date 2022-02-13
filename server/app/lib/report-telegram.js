import axios from 'axios';
// 发送消息的api
const telegramApi = 'https://api.telegram.org/bot5263440831:AAFbN28wKEMCWWtXu_KVQ9I-S0msV6L14ts/sendMessage';
// 发送消息的机器人群组id
const chatId = '-590496372';

// event为sentry捕获的错误事件对象
const telegram = event => {
  let { title = '-', message = '-', errorStack = '-', img = '' } = event;
  if (event) {
    axios({
      method: 'post',
      url: telegramApi,
      data: {
        parse_mode: 'HTML',
        chat_id: chatId,
        text: `
          \n\n<b><u>-- ${title} --</u></b>
          \n<b>错误信息: </b><pre>${message}</pre>
          \n<b>errorStack: </b><pre>${errorStack}</pre>
          \n<b>错误截图: </b><a href="${img}">点击查看</a>
          \n<b>发生时间: </b><pre>${new Date().toLocaleString()}</pre>
        `
      }
    });
  }
};

export default telegram;
