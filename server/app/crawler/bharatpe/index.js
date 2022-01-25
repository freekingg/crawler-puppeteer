import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dayjs from 'dayjs';

import checkIp from '../../lib/checkIp';
import signin from './signin';
import start from './start';

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
  static getParams(newJobTime = {}) {
    let time = {
      startTime: dayjs(newJobTime['endTime']).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(newJobTime['endTime'])
        .add(1, 'minute')
        .format('YYYY-MM-DD HH:mm:ss')
    };
    return time;
  }

  constructor(opts = {}) {
    this._opts = opts;
    this.launchOptions = launchOptions;
  }

  /**
   * 是否已经通过验证、是否已登录
   *
   * @member {boolean}
   */
  get isAuthenticated() {
    return !!this._user;
  }

  /**
   * 获取登录的用户
   *
   * @member {Object}
   */
  get user() {
    return this._user;
  }

  /**
   * Puppeteer 实例
   *
   * @return {Promise<Object>}
   */
  async browser() {
    if (!this._browser) {
      let launchOptions = {
        headless: false,
        ...this._opts.puppeteer
      };

      // 设置代理
      if (this._opts.proxyType && this._opts.proxyIp && this._opts.proxyType != 4) {
        this.launchOptions.args.push(`--proxy-server=http://${this._opts.proxyIp}`);
        let canuse = await checkIp({ ip: this._opts.proxyI });
        if (!canuse) {
          // 代理不可用
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
   * @param {Object} [opts={ }] - Options
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
    return authData;
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
      const browser = await this.browser();
      res = await start(browser, opts);
    } catch (error) {
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
}

PuppeteerBharatpe.initParams = {
  startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  endTime: dayjs()
    .add(1, 'minute')
    .format('YYYY-MM-DD HH:mm:ss')
};
export { PuppeteerBharatpe };
// export default { PuppeteerBharatpe };
