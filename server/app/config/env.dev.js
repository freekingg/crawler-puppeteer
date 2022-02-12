'use strict';
module.exports = {
  port: 5000,
  siteDomain: 'http://localhost:5000',
  db: {
    database: 'crawler',
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    username: 'root',
    password: '123456',
    logging: false,
    // timezone: '+08:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    define: {
      charset: 'utf8mb4'
    }
  },
  redis: {
    host: '47.243.128.145',
    port: 6378,
    password: 'mNtkAF2pEuqScB47kJO9EddqXhTvS4IE0ntbJBN4Ldg='
  },
  rabbitMq: {
    host: '47.243.128.145',
    port: 5673,
    username: 'usdt',
    password: 'usdt'
  },
  secret: '\x88W\xf09\x91\x07\x98\x89\x87\x96\xa0A\xc68\xf9\xecJJU\x17\xc5V\xbe\x8b\xef\xd7\xd8\xd3\xe6\x95*4' // 发布生产环境前，请务必修改此默认秘钥
};
