import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

export default async function(browser, opts) {
  const page = browser;

  let { params } = opts;
  // 设置参数 2022-01-20  2022-01-21
  let localDateStart = dayjs(params.startTime).format('MMMM D YYYY h:mm A');
  let splitDateStart = localDateStart.split(' ');
  let targetDayStart = dayjs(localDateStart).date(); // 开始日期
  let targetMonthValueStart = splitDateStart[0]; // 开始月份

  let localDateEnd = dayjs(params.endTime).format('MMMM D YYYY h:mm A');
  let splitDateEnd = localDateEnd.split(' ');
  let targetDayEnd = dayjs(localDateEnd).date(); // 结束日期
  let targetMonthValueEnd = splitDateEnd[0]; // 结束月份

  // 选择日期模式
  await page.waitFor('#collapsiblePage', { visible: true });
  await page.click('#collapsiblePage input[value="DateRange"]');

  // 打开日期选择器
  await page.waitFor('#collapsiblePage .date-range-div', { visible: true });
  let datePickers = await page.$$('.date-range-div .oj-inputdatetime-input-trigger');
  await page.waitForTimeout(500);
  // 开始选择控件
  await datePickers[0].click();
  await page.waitForTimeout(500);
  const monthValueStart = await page.$eval('.oj-datepicker-popup:first-child .oj-datepicker-month', el => el.innerText);
  // 不需要翻页,直接选择日期
  if (targetMonthValueStart == monthValueStart) {
    let dates = await page.$$('.oj-popup-layer td.oj-enabled');
    const indexs = await page.$$eval('.oj-popup-layer td.oj-enabled a', els => els.map(el => el.innerText));
    console.log('indexs: ', indexs);
    let index = indexs.findIndex(i => i == targetDayStart);
    console.log('targetDayStart: ', targetDayStart);
    console.log('index: ', index);
    if (index == -1) {
      return Promise.reject(new Error('选择日期出错'));
    }
    await dates[index].click({ delay: 200 });
    await page.waitForTimeout(1000);
  }

  // 结束选择控件
  await datePickers[1].click();
  await page.waitForTimeout(500);
  const monthValueEnd = await page.$eval('.oj-datepicker-popup:last-child .oj-datepicker-month', el => el.innerText);
  // 不需要翻页,直接选择日期
  if (targetMonthValueEnd == monthValueEnd) {
    let dates = await page.$$('.oj-popup-layer td.oj-enabled');
    const indexs = await page.$$eval('.oj-popup-layer td.oj-enabled a', els => els.map(el => el.innerText));
    console.log('indexs: ', indexs);
    let index = indexs.findIndex(i => i == targetDayEnd);
    console.log('index: ', index);
    if (index == -1) {
      return Promise.reject(new Error('选择日期出错'));
    }
    await dates[index].click({ delay: 200 });
    await page.waitForTimeout(500);
  }

  const getAllHistory = (resolve, reject) => {
    page.on('response', response => {
      if (response.url().indexOf('transactions') !== -1) {
        response.json().then(function(result) {
          console.log('result: ', result);
          if (result) {
            resolve(result);
          }
        });
      }
    });
  };
  let getAllHistoryHandle = new Promise(getAllHistory);

  // 查询按钮
  await page.click('.submitfilter button');
  let result = await getAllHistoryHandle;
  return result;
  // page.close()
}
