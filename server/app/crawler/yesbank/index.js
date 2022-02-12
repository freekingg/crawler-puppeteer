import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dayjs from 'dayjs';
import path from 'path';

import { screenshot } from '../../lib/tg-util';

import { CrawlerDataDao } from '../../dao/crawler-data';
import { sender } from '../../lib/rabbitMq';
import checkIp from '../../lib/checkIp';
import signin, { login } from './signin';
import start from './start';

import localizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);

const CrawlerDataDto = new CrawlerDataDao();

// let data = {
//   rabbitRoutingKey: 'other.bank.query.pay.routing.key',
//   objects: ['shorid', '888', '222222222223', '系统', '1486252900431376386', 'test-content', '2021-02-10 10:10:10'],
//   id: '1486696423914229762'
// };
// sender(data);

puppeteer.use(StealthPlugin());

let launchOptions = {
  // headless: false,
  timeout: 60000,
  ignoreHTTPSErrors: true,
  devtools: false,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-xss-auditor',
    '--disable-accelerated-2d-canvas',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--no-zygote',
    '--disable-setuid-sandbox',
    '--no-sandbox',
    '--disable-webgl',
    '--disable-dev-shm-usage',
    '--disable-xss-auditor', // 关闭 XSS Auditor
    '--no-zygote',
    '--no-sandbox',
    '--allow-running-insecure-content', // 允许不安全内容
    '--disable-webgl',
    '--disable-popup-blocking',
    '--disable-infobars',
    '--disable-features=IsolateOrigins,site-per-process'
    // `${proxyObj}`
  ]
};

/**
 * puppeteer 自动化执行类
 *
 * @param {Object} [opts={ }] - Options
 * @param {Object} [opts.browser] - Puppeteer browser instance to use
 * @param {Object} [opts.puppeteer] - Puppeteer [launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)
 */
class PuppeteerYesbank {
  constructor(opts = {}) {
    this._opts = opts;
    this.launchOptions = launchOptions;
    this.init = false; // 是否初始化完成 - 主要用于第一次登录时间较长控制
    this.page = null;
    this.lastDateTime = null;
  }

  /**
   * 是否已经通过验证、是否已登录
   *
   * @member {boolean}
   */
  isAuthenticated(page, verifyUrl = '') {
    if (page.url().indexOf('module=login') !== -1) return false;
    return true;
  }

  /**
   * Puppeteer 实例
   *
   * @return {Promise<Object>}
   */
  async browser() {
    if (!this._browser) {
      let launchOptions = {
        ...this.launchOptions
      };

      // 设置代理
      if (this._opts.proxyType && this._opts.proxyIp && this._opts.proxyType != 4) {
        this.launchOptions.args.push(`--proxy-server=http://${this._opts.proxyIp}`);
        let canuse = await checkIp({ ip: this._opts.proxyI });
        if (!canuse) {
          return Promise.reject(new Error(`${this._opts.title} - ${this._opts.proxyIp} 代理不可用`));
        }
      }

      this._browser = await puppeteer.launch(launchOptions);
      this._browser.on('disconnected', e => {
        console.log('浏览器关闭了', e);
        this._browser = null;
      });
    }

    return this._browser;
  }

  /**
   * 登录
   *
   * @param {Object} [opts={ }] - 登录信息 Options
   * @param {string} [opts.account] - account
   * @param {string} [opts.pwd] - pwd
   * @return {Promise}
   */
  async signin(opts = {}) {
    if (!opts.account || !opts.pwd) {
      return Promise.reject(new Error('登录信息不完整，'));
    }
    let authData = {};
    authData = await signin(null, opts);
    return authData;
  }

  /**
   * 预执行任务
   *
   * @param {Object} opts - 参数
   * @return {Promise}
   *
   */
  async preStart(opts = {}) {
    const browser = await this.browser();
    const page = await browser.newPage();
    const headers = {
      'Accept-Encoding': 'gzip'
    };

    try {
      await page.setExtraHTTPHeaders(headers);
      opts.isAuthenticated = false;

      await login(page, opts);
      console.log('登录成功');
      await page.waitForTimeout(1000);
      // 跳转到流水页面
      await page.waitFor('.oj-conveyorbelt-item:nth-child(5) > .quick-link > .quick-link-icon > a > img', {
        visible: true
      });
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('.oj-conveyorbelt-item:nth-child(5) > .quick-link > .quick-link-icon > a > img')
      ]);
      await page.waitForTimeout(1000);
      this.init = true;
      this.page = page;
      return this.page;
    } catch (error) {
      screenshot(page, path.join(__dirname, '/log', 'login-error.png'));
      return Promise.reject(error);
    }
  }

  /**
   * 开始执行任务
   *
   * @param {Object} opts - 参数
   * @return {Promise}
   *
   */
  async start(opts = {}) {
    let res = {};
    if (opts.retask) return Promise.reject(new Error('不允许重新执行任务失败'));
    try {
      if (!this.page) {
        this.page = await this.preStart(opts);
      }
      if (!this.init) {
        console.log('初始化未完成，等待下一次执行');
        return Promise.reject(new Error('初始化未完成，等待下一次执行'));
      }
      res = await start(this.page, opts);
    } catch (error) {
      // this.page = null;
      screenshot(this.page, path.join(__dirname, '/log', 'task-error.png'));
      return Promise.reject(error);
    }
    return res;
  }

  /**
   * 关闭实例
   *
   * @return {Promise}
   */
  async close() {
    const browser = await this.browser();
    await browser.close();
    this._browser = null;
  }

  /**
   * 保存数据至数据库&发送MQ
   *
   * @return {Promise}
   */
  async createItem(item) {
    let result = await CrawlerDataDto.createItem(item);
    if (result) {
      let memberId = '';
      if (this._opts.extra) {
        let extra = JSON.parse(this._opts.extra);
        if (!extra.memberId) {
          return Promise.reject(new Error('未配置账户id--accountId'));
        }
        memberId = `${extra.memberId}`;
      }

      // mq发送数据
      let data = {
        rabbitRoutingKey: 'other.bank.query.pay.routing.key',
        objects: [
          '',
          String(item.amount),
          String(item.utrId),
          '系统',
          memberId,
          String(item.description),
          String(item.tradeTime)
        ],
        id: '-1'
      };
      sender(data);
    }
    return true;
  }

  /**
   * 过滤结果
   * @params {Object} result:返回的响应数据  crawlerTaskId:每轮的任务id taskId:任务id
   * @return {Object} Object.info 扩展信息  Object.data 返回的列表数据
   */

  filterResult(result, crawlerTaskId = '', taskId = '') {
    if (!result.items) {
      result.items = [];
    }

    let filterData = [];
    // 根据最后一条订单时间过街过滤
    if (this.lastDateTime) {
      // 过滤最后订单时间 之后的订单  （小时进行判断）
      filterData = result.items.filter(item => {
        return dayjs(item.transactionDate).isSameOrAfter(this.lastDateTime, 'minute');
      });
      console.log(`根据最后一次的订单${this.lastDateTime}进行过滤`, filterData.length);
    } else {
      filterData = result.items;
    }

    let data = filterData.map(item => {
      let [p1, utrId, received_from] = item.description.split('/');
      return {
        receivedFrom: received_from,
        utrId: utrId,
        vpaId: '',
        orderId: '',
        amount: item.amountInAccountCurrency.amount,
        taskId: taskId,
        crawlerTaskId: crawlerTaskId,
        tradeTime: item.transactionDate,
        description: item.description,
        extra: ''
      };
    });

    // 记录最后一条数据时间
    if (data.length) {
      this.lastDateTime = data[0]['tradeTime'];
      console.log('最后一条数据时间', this.lastDateTime);
    }

    return {
      list: data || [],
      info: {
        total: filterData.length,
        creditCount: result.summary ? result.summary.creditCount : '',
        amount: result.summary ? result.summary.creditAmount : '',
        periodStartDate: result.summary ? result.summary.periodStartDate : '',
        periodEndDate: result.summary ? result.summary.periodEndDate : ''
      }
    };
  }

  /**
   * 获取每次查询的参数
   * @params {newJobTime} 开始与结束时间
   * @return {Object}
   */
  static getParams(newJobTime = {}) {
    let time = {
      startTime: dayjs(newJobTime['endTime']).format('YYYY-MM-DD'),
      endTime: dayjs().format('YYYY-MM-DD')
      // startTime: dayjs('2022-02-04').format('YYYY-MM-DD'),
      // endTime: dayjs(newJobTime['endTime'])
      //   .add(1, 'day')
      //   .format('YYYY-MM-DD')
    };
    return time;
  }
}

// 默认查询参数
PuppeteerYesbank.initParams = {
  startTime: dayjs().format('YYYY-MM-DD'),
  endTime: dayjs().format('YYYY-MM-DD')
  // endTime: dayjs('2022-02-08').format('YYYY-MM-DD')
};
export { PuppeteerYesbank };
// export default { PuppeteerBharatpe };
