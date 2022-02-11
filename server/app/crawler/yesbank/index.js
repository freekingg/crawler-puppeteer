import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dayjs from 'dayjs';

import { isEmptyObject } from '../../lib/util';

import { TaskDao } from '../../dao/crawler-task';
import { CrawlerDataDao } from '../../dao/crawler-data';

import checkIp from '../../lib/checkIp';
import signin, { login } from './signin';
import start from './start';

import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const TaskDto = new TaskDao();
const CrawlerDataDto = new CrawlerDataDao();

puppeteer.use(StealthPlugin());

let localDateStart = dayjs('2022-01-05').format('MMMM D YYYY h:mm A');
let splitDateStart = localDateStart.split(' ');
let targetDayStart = dayjs(localDateStart).date(); //开始日期
console.log('targetDayStart: ', targetDayStart);
let targetMonthValueStart = splitDateStart[0]; //开始月份
console.log('targetMonthValueStart: ', targetMonthValueStart);

let launchOptions = {
  headless: false,
  timeout: 60000,
  ignoreHTTPSErrors: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
class PuppeteerYesbank {
  static getParams(newJobTime = {}) {
    let time = {
      startTime: dayjs().format('YYYY-MM-DD'),
      endTime: dayjs().format('YYYY-MM-DD')
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
    try {
      const browser = await this.browser();
      authData = await signin(browser, opts);
      console.log('authData: ', authData);
    } catch (error) {
      return Promise.reject(error);
    }
    // this.close();
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
    try {
      const browser = await this.browser();
      const page = await browser.newPage();
      const headers = {
        'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
      };
      await page.setExtraHTTPHeaders(headers);
      opts.isAuthenticated = false;
      await login(page, opts);
      console.log('登录成功');
      // await page.goto('https://yesonline.yesbank.co.in/pages/home.html?module=YPONI');
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
   */

  filterResult(result, crawlerTaskId = '') {
    console.log('result', result);
    let data = result.items.map(item => {
      let [p1, utrId, received_from] = item.description.split('/');
      return {
        receivedFrom: received_from,
        utrId: utrId,
        vpaId: '',
        orderId: '',
        amount: item.amountInAccountCurrency.amount,
        crawlerTaskId: crawlerTaskId,
        tradeTime: item.transactionDate,
        extra: ''
      };
    });
    return {
      list: data || [],
      info: {}
    };
  }
}

PuppeteerYesbank.initParams = {
  startTime: dayjs('2022-02-09').format('YYYY-MM-DD'),
  endTime: dayjs().format('YYYY-MM-DD')
};
export { PuppeteerYesbank };
// export default { PuppeteerBharatpe };
