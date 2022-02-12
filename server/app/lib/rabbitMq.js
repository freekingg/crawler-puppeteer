import { config } from 'lin-mizar';
import Amqp from 'amqplib';

/**
 * redis配置项
 */
const options = config.getItem('rabbitMq', {});

const OTHER_EXCHANGE = 'other.exchange';
const CRAWLER_QUEUE = 'other.queue';
const OTHER_ROUTING_GROUP_KEY = 'other.bank.query.pay.routing.key';

/**
 * 全局的 Amqp 实例
 */
const AmqpOptions = {
  hostname: options.host,
  port: options.port,
  username: options.username,
  password: options.password
};

let connection = null;
async function init() {
  return new Promise(resolve => {
    if (!connection) {
      Amqp.connect(AmqpOptions)
        .then(con => {
          connection = con;
          // 监听连接错误
          con.on('error', function(err) {
            console.error('[mq] connection error ', err);
            connection = null;
          });
          resolve(connection);
        })
        .catch(err => {
          connection = null;
          console.log('rabbitMq connect error', err);
        });
    } else {
      resolve(connection);
    }
  });
}
/**
 * 路由一个死信队列
 * @param { Object } connnection
 */
async function sender(data) {
  /* 
    1. 建立连接
    2. 创建信道
    3. 声明队列
    4. 发送消息
    5. 关闭队列
    */
  const connnection = connection || (await init());
  const ch = await connnection.createChannel();
  const ex = await ch.assertExchange('other.exchange', 'direct');
  const queueResult = await ch.assertQueue('BANK_DATA_QUEUE');
  console.log('queueResult', queueResult);
  // // await ch.bindQueue(queueResult.queue, ex.exchange);
  var res = await ch.sendToQueue(queueResult.queue, Buffer.from(JSON.stringify(data)));
  // var res = ch.publish(queueResult.queue, 'bank_data_routing_group_key', Buffer.from(JSON.stringify(data)));
  console.log('sender', res);
  ch.close();
}

export { sender };
