import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dayjs from 'dayjs';

import { isEmptyObject } from '../../lib/util';

import { TaskDao } from '../../dao/crawler-task';
import { CrawlerDataDao } from '../../dao/crawler-data';

import checkIp from '../../lib/checkIp';
import signin, { login } from './signin';
import start from './start';

const TaskDto = new TaskDao();
const CrawlerDataDto = new CrawlerDataDao();

puppeteer.use(StealthPlugin());

let launchOptions = {
  headless: false,
  timeout: 60000,
  ignoreHTTPSErrors: true, // 忽略证书错误
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-xss-auditor',
    '--disable-accelerated-2d-canvas',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--no-zygote',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-webgl',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-xss-auditor', // 关闭 XSS Auditor
    '--no-zygote',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--allow-running-insecure-content', // 允许不安全内容
    '--disable-webgl',
    '--disable-popup-blocking',
    '--disable-infobars'
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
class PuppeteerBharatpe {
  /**
   * 获取每轮任务查询参数
   *
   * @return {Object}
   */
  static getParams(newJobTime = {}) {
    let time = {
      startTime: dayjs(newJobTime['endTime'])
        .set('second', 0)
        .subtract(1, 'minute')
        .format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs()
        .set('second', 0)
        .add(1, 'minute')
        .format('YYYY-MM-DD HH:mm:ss')
    };
    return time;
  }

  constructor(opts = {}) {
    this._opts = opts;
    this.launchOptions = launchOptions;
    this.page = null;
  }

  /**
   * 是否已经通过验证、是否已登录
   *
   * @member {boolean}
   */
  isAuthenticated(page, verifyUrl = '') {
    if (page.url() === (verifyUrl || 'https://enterprise.bharatpe.in/')) return false;
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
    try {
      const browser = await this.browser();
      authData = await signin(browser, opts);
    } catch (error) {
      return Promise.reject(error);
    }
    this.close();
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
    let { authData } = opts;
    try {
      const browser = await this.browser();
      const page = await browser.newPage();
      const headers = {
        'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
      };
      await page.setExtraHTTPHeaders(headers);
      await page.goto(opts.url, { waitUntil: 'networkidle2' });

      // 设置authData 为登录状态
      let _authData = isEmptyObject(authData);
      await page.evaluate(authDatas => {
        if (!authDatas) return;
        let { localStorageData } = authDatas;
        if (localStorageData) {
          Object.keys(localStorageData).forEach(function(key) {
            localStorage.setItem(key, localStorageData[key]);
          });
        }
      }, _authData);

      let { cookie } = _authData;
      await page.setCookie(...cookie);

      // 刷新页面，验证登录状态
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitFor(1000);

      // 检查登录状态
      let isAuthenticated = this.isAuthenticated(page);
      if (!isAuthenticated) {
        opts.isAuthenticated = isAuthenticated;
        let newAuthData = await login(page, opts);
        _authData = isEmptyObject(JSON.stringify(newAuthData));
        await TaskDto.updateTaskAuthData({ authData }, opts.id);
      }
      this.page = page;
      return this.page;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 开始执行任务
   *
   * @param {string} repo - GitHub repository identifier
   * @return {Promise}
   *
   */
  async start(opts = {}) {
    let res = {};
    try {
      if (!this.page) {
        this.page = await this.preStart(opts);
      }
      res = await start(this.page, opts);
    } catch (error) {
      this.page = null;
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
   * 保存数据至数据库
   *
   * @return {Promise}
   */
  async createItem(item) {
    return CrawlerDataDto.createItem(item);
  }

  /**
   * 过滤结果
   * @params {Object} Object.result 返回的响应数据  Object.crawlerTaskId 任务id
   * @return {Object} Object.info 扩展信息  Object.data 返回的列表数据
   * @return {Object} Object.list 扩展信息  Object.list 返回的列表数据
   */

  filterResult(result, crawlerTaskId = '') {
    console.log('result', result);
    let data = result.data.txns.map(item => {
      return {
        receivedFrom: item.received_from,
        utrId: item.utr,
        vpaId: item.vpa,
        orderId: item.order_id,
        amount: item.amount,
        crawlerTaskId: crawlerTaskId,
        tradeTime: item.txn_date,
        extra: JSON.stringify({ txn_id: item.txn_id, txn_type: item.txn_type, merchant_id: item.merchant_id })
      };
    });
    return {
      list: data || [],
      info: {
        total: result.data.total.txns,
        amount: result.data.total.net_settlement_amount,
        txn_date: result.data.total.txn_date,
        txn_date_end: result.data.total.txn_date_end
      }
    };
  }
}

PuppeteerBharatpe.initParams = {
  startTime: dayjs()
    .set('second', 0)
    .subtract(1, 'minute')
    .format('YYYY-MM-DD HH:mm:ss'),
  endTime: dayjs()
    .set('second', 0)
    .format('YYYY-MM-DD HH:mm:ss')
};
export { PuppeteerBharatpe };
// export default { PuppeteerBharatpe };
