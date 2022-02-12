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

  let targetMonth = dayjs(localDateStart).month(); // 开始月
  let currentMonth = dayjs().month(); // 当前月

  // 暂时不支持跨月任务
  if (targetMonth != currentMonth) {
    return Promise.reject(new Error('暂时不支持跨月任务'));
  }

  // 选择日期模式
  await page.waitFor('#collapsiblePage', { visible: true });
  await page.click('#collapsiblePage input[value="DateRange"]');

  // 打开日期选择器
  await page.waitFor('#collapsiblePage .date-range-div', { visible: true });
  let datePickers = await page.$$('.date-range-div .oj-inputdatetime-input-trigger');
  await page.waitForTimeout(1000);
  // 开始选择控件
  await datePickers[0].click();
  await page.waitForTimeout(1000);

  // 直接选择日期
  let datesStart = await page.$$('.oj-popup-layer td.oj-enabled');
  const indexsStart = await page.$$eval('.oj-popup-layer td.oj-enabled a', els => els.map(el => el.innerText));
  console.log('indexsStart: ', indexsStart);
  let indexStart = indexsStart.findIndex(i => i == targetDayStart);
  console.log('targetDayStart: ', targetDayStart);
  console.log('indexStart: ', indexStart + 1);
  if (indexStart == -1) {
    return Promise.reject(new Error('选择日期出错'));
  }
  await datesStart[indexStart].click();
  await page.waitForTimeout(1000);

  // 结束选择控件
  await datePickers[1].click();
  await page.waitForTimeout(1000);
  // 直接选择日期
  let datesEnd = await page.$$('.oj-popup-layer td.oj-enabled');
  const indexsEnd = await page.$$eval('.oj-popup-layer td.oj-enabled a', els => els.map(el => el.innerText));
  console.log('indexsEnd: ', indexsEnd);
  let indexEnd = indexsEnd.findIndex(i => i == targetDayEnd);
  console.log('indexEnd: ', indexEnd + 1);
  if (indexEnd == -1) {
    return Promise.reject(new Error('选择日期出错'));
  }
  await datesEnd[indexEnd].click();
  await page.waitForTimeout(1000);

  const getAllHistory = (resolve, reject) => {
    page.on('response', response => {
      if (response.url().indexOf('transactions') !== -1) {
        response.json().then(function(result) {
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

  // 没有数据，需要关闭弹窗
  if (result.message && result.message.type == 'ERROR') {
    await page.waitForTimeout(1000);
    await page.click('.message-box-container button');
  }

  return result;
  // page.close()
}
