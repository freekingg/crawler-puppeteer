'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./env.prod');
} else {
  module.exports = require('./env.dev');
}

// 配置 说明
// https://doc.cms.talelin.com/server/koa/config.html
