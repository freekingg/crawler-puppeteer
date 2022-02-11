import { config } from 'lin-mizar';
import Redis from 'ioredis';

/**
 * redis配置项
 */
const options = config.getItem('redis', {});
console.log('options: ', options);

/**
 * 全局的 redis 实例
 */
const redis = new Redis({
  port: options.port,
  host: options.host,
  password: options.password,
  db: 5
})

redis.on('connect', () => {
  console.log('redis connect ok');
});
redis.on('error', (err) => {
  console.log('redis connect error', err);
});

export default redis;
