import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import signin from "./signin";
import start from "./start";

puppeteer.use(StealthPlugin());

/**
 * puppeteer 自动化执行类
 *
 * @param {Object} [opts={ }] - Options
 * @param {Object} [opts.browser] - Puppeteer browser instance to use
 * @param {Object} [opts.puppeteer] - Puppeteer [launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)
 */
class PuppeteerBharatpe {
  constructor(opts = {}) {
    this._opts = { ...opts, puppeteer: { headless: false } };
    this._user = null;
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
      this._browser = await puppeteer.launch(this._opts.puppeteer);
      this._browser.on("disconnected", (e) => {
        console.log("浏览器关闭了", e);
        this._browser = null
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
    if (!opts.account || !opts.pwd) throw new Error("登录信息不完整，");
    const browser = await this.browser();
    let authData = {};
    authData = await signin(browser, opts);
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
    const browser = await this.browser();
    let res = await start(browser, opts);
    return res
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
export { PuppeteerBharatpe };
// export default { PuppeteerBharatpe };
