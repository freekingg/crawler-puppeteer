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

// puppeteer.use(StealthPlugin());

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
class PuppeteerTest {
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
    let { authData } = opts;
    try {
      const browser = await this.browser();
      const page = await browser.newPage();
      const headers = {
        'Accept-Encoding': 'gzip' // 使用gzip压缩让数据传输更快
      };
      await page.setExtraHTTPHeaders(headers);
      await page.goto(opts.url, { waitUntil: 'networkidle0' });

      // 设置authData 为登录状态
      // let _authData = isEmptyObject(authData);
      // await page.evaluate(authDatas => {
      //   if (!authDatas) return;
      //   let { localStorageData } = authDatas;
      //   if (localStorageData) {
      //     Object.keys(localStorageData).forEach(function(key) {
      //       localStorage.setItem(key, localStorageData[key]);
      //     });
      //   }
      // }, _authData);

      // let { cookie } = _authData;
      let cookie = [
        {
            "domain": ".yesbank.co.in",
            "expirationDate": 1644478455.786091,
            "hostOnly": false,
            "httpOnly": true,
            "name": "bm_sv",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "057F7E0BFC52621E7A4C76297E72129D~W+tLaDt7DuMRl1hNOfHHO2O2vl7/FqcAVV/sfEe7qsrX6Q7FfvOMOSI1c9p0ch46eK77Mm1O0GHIYEVbynDzJ4G+xVWFX6ZkoDmkWtFBpvLJhis/OPn0nTzUAYrYrLH9LxWbQ3QeJwNEwst1yG3slr9RbLleWT4xKiUiLRw+qCA="
        },
        {
            "domain": "yesonline.yesbank.co.in",
            "expirationDate": 1660124059,
            "hostOnly": true,
            "httpOnly": false,
            "name": "cl5_cookie2",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "{\"cl5SetCookie\":\"XYCloaQruw7Yz9t9eN85ksEgFZ+bINDnywz4Tg+vG4bmojUf9JU34GrFCwqjhmcNtJVTgDPdiQaDN32D8N6u8F0tWRS9RO2MU2KKXbXrDCedNK/fOkWU20bBr3M/sExoIyUlSK6qJRQNEDLqWssoboCA22TEzal9EJW7INkcGL0hhTZB0TmseUI1jEzU72JMILr3lsZSNf1NRn0Sg5DFOrfUD9HMBzObdSyAhysGlt7HRes+iZNZQT8IawD2mLFdZGNnI9CYBi6RI84ZLB3C0M+T7eCzuPAbCkqpqHXRzNnc+lDMrc0xQoB3x8MMFOdDWr8nR0t+FMC4gXtJzlZlc9SsA0e5gXhYvMr69eX6KJe6sDt7Wrl5VNDVNbmdiT5rZSVrSIAxvewPC6/6ib74izJj2ieBVj5t02cMSN7NM3rsstPxBy0fCXjnODSub+sMPbI5ag9o0gsSShdzLIIKt/ulcjD/vO/PBYNkJyHDXEwEzEeGKLBhg2fN+tvS/f+0uDTLjeyE1T49limorsji8ca6vJi1Z+9w21xFKfr3FCjp6C690H26jZomk0lm4EhRpdiow4OhfOrOvH7QuUruoGwBJblvcm16yvG9/gxLymdabJwQ2xD5RX4vfRuDMgcbHNcanRIbdBMJQI7ywBmqC66Cf2wvxfbxPbSsk3hwLVM=\"}"
        },
        {
            "domain": "yesonline.yesbank.co.in",
            "expirationDate": 1660124059,
            "hostOnly": true,
            "httpOnly": false,
            "name": "cl5_cookie1",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "{\"cl5SetCookie\":\"nz4/L6NHbvZP2v42kREzpo+ik9dPo+KSabsbta+48+qDxTMxq01dkf9J3AZUH3PuCaLE3PymkGPQConhcC3OMGnS1/NUVwCsEQkeEOmkjZ+MP5pXcXPcfwNKkyMgurNZxIBUiGHV14QR1RLKNhx5x2R55OfE5PfKyqPfWCeMMEJ2vSRAhDbLwR+FLtpbfWkItgusXAUpFdaAOT3ov9oJbypxVv/EyWFaPL/sKxueATrwYBG//qcBfotjYLbgm4uG+ezoeYH1L7+jTQcLWSFc/SPD5J9hj3m7uJXeh52Bf+KONfuo95JANEF9iIlwJqlG8VeahV53wegD16DJ3YIc4OxFWtDRY9I6daf1v/FlV8Zna3pLlL6FPMM5QPD8TjYAu3cc/Py9eletswQP11DpTDjm/ceGoj7EWXwrMxES43sRviOqzR1QoZkZDFctKy0buiP+u6edgVkIOKZQQwiOvWD5V9nyLPhU11N0E0Iv2mGm8euE+EfRwOgJCiG/XTkIwEnrE6x3l+kCGNTuSz3o3Xg4EPFJYB0+LIWEfVqA1pCPyW4MfGtI0tNG2PzZa0qzJ/pxj2o1a8U022lapVkbsJH3AtAeubgRjhxzdYJqRCzT+ebNPCfAP2hL2DXtqiI6CwXA/mJj/FFWBrIygWgkhnftUEiovsmsnFhVNB77vsY=\"}"
        },
        {
            "domain": "yesonline.yesbank.co.in",
            "expirationDate": 1660124059,
            "hostOnly": true,
            "httpOnly": false,
            "name": "Cl5_DeviceID",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "1644471259180123"
        },
        {
            "domain": ".yesbank.co.in",
            "expirationDate": 1676010695.450744,
            "hostOnly": false,
            "httpOnly": false,
            "name": "_abck",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "5473643FB461B5921EBEFD5037109D42~0~YAAQfKZUuAY+ct9+AQAA6XxU4geU4CejcjNMPCe5N11iSMTxv6KeYw+bABd0GqE3vgzuEd7I9uH80nleDolMI5z5WeUu5ofX7yH3L++cwAdaSTFGMKj45UXCWiZQd06D/mDXwIu6z9BYScSN+PqlNI9/2vD83ShFo1U1VYfi/CpAn0nS5L3r7rRVfH+39GwC/4OVvan+kWiygys/M8s7/9jWFzKFyBDiD5AOcoyB+N2qzzZ/VSsujgKG2dnG299GVRVUntgIPV9S/E9Ysk3rnvbvR1Jt1GcNx9IbkJvsDw7jcsQeG+AL9FUDlWUdsSNHYSiqvXAFMG5exr0Pmx486Y923bp3RhfVLKEcaWranARRD+zFUc6BiDfqrIsTmRRdkRIzM7jVRoso84S3Y79ArUowkjPn8qfljqXo~-1~-1~-1"
        },
        {
            "domain": ".yesbank.co.in",
            "expirationDate": 1644478454.097149,
            "hostOnly": false,
            "httpOnly": true,
            "name": "ak_bmsc",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "10E7057076F4858232810DF2E45B111B~000000000000000000000000000000~YAAQfKZUuI2rcN9+AQAAAgIg4g7+N3JqelDEEMPiPw5hWoJgs/5d2zFPd0ZhGeD3BcslTIrEUmN3qdNptGS1K11b/Kz2gRNiI473evaumtEYrFeDmZ5vaJc45jLjKjdK9YbhxGZ2kt3ykzCbwZPgsVYw13ZMJp3hnH8Q7woifQrCrG0aju/7B2YFrlBsL625eEnEALQLvkZ4rxccAPG3PQMFFu7iLptDzpOzHi05L9t/UpNLHE+/FIkIiTTLjHpAHuI0FQCpEvtjEIejY8FywBZoC6WG5FbOBtsQGxd4INZfeDEm24VXQxxwVcBMYdrOI6LJ/xV5Q2Isl1hGIKI4jfOooXsaqtfO3icGW+r6sgfJKfVSvABJpm2IxxBKAm6hCCITddbRh4dL5Jsc8Dvv1kI+1IVUcN4DDRy4I+KX9Xdq6J4UQYfm9UqL50qKuE2KoWxaURFZzcYBHNnSr5ZbBmvoUrzDKkUAg1AtI+qKAn/6v5SLa+hrF0dkelU="
        },
        {
            "domain": ".yesbank.co.in",
            "expirationDate": 1644485653.773643,
            "hostOnly": false,
            "httpOnly": true,
            "name": "bm_sz",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "F17F7C08724FDB36E876882772CF5BC1~YAAQfKZUuFGrcN9+AQAAz/wf4g7OPCecWaN6nhdrqitA/iGV7E0GCMWIrUa8G9PXSir2jkMnswnnd4Axfi+sblb7aSDPu+MLOibcvErBz8bu/1Pu/9M0WmIYZd3rqy8fl3resLfvxUrcGZImHHiPVpG9M/u1QziTtEP43o23ryGWsBMl1a58877uQEBAHiV8V/MG"
        },
        {
            "domain": "yesonline.yesbank.co.in",
            "expirationDate": 1644476464.78594,
            "hostOnly": true,
            "httpOnly": true,
            "name": "NSC_PCEY-WJQ",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "ffffffffaf131ad845525d5f4f58455e445a4a42276b"
        }
      ]
      await page.setCookie(...cookie);

      // 刷新页面，验证登录状态
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitFor(1000);
      console.log('刷新页面，验证登录状态');

      // 检查登录状态
      let isAuthenticated = this.isAuthenticated(page);
      console.log('检查登录状态',isAuthenticated);
      // if (!isAuthenticated) {
      //   opts.isAuthenticated = isAuthenticated;
      //   let newAuthData = await login(page, opts);
      //   _authData = isEmptyObject(JSON.stringify(newAuthData));
      //   await TaskDto.updateTaskAuthData({ authData }, opts.id);
      // }
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
      // res = await start(this.page, opts);
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

PuppeteerTest.initParams = {
  startTime: dayjs()
    .set('second', 0)
    .subtract(1, 'minute')
    .format('YYYY-MM-DD HH:mm:ss'),
  endTime: dayjs()
    .set('second', 0)
    .format('YYYY-MM-DD HH:mm:ss')
};
export { PuppeteerTest };
// export default { PuppeteerBharatpe };
