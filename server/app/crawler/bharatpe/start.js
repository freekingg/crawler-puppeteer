
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

export default async function(browser, opts) {
  const page = browser;
  try {
    let { params } = opts;
    // 设置参数 2022-01-20 07:30:00  2022-01-20 07:60:00
    let localDateStart = dayjs(params.startTime).format('MMM D YYYY h:mm A');
    let splitDateStart = localDateStart.split(' ');
    let targetDayStart = dayjs(localDateStart).date();
    let targetHourStart = dayjs(localDateStart).hour();
    let targetMinuteStart = dayjs(localDateStart).minute();
    let targetAmStart = splitDateStart[4];
    let targetMonthValueStart = [splitDateStart[0], splitDateStart[2]].join(' ');

    let localDateEnd = dayjs(params.endTime).format('MMM D YYYY h:mm A');
    let splitDateEnd = localDateEnd.split(' ');
    let targetHourEnd = dayjs(localDateEnd).hour();
    let targetMinuteEnd = dayjs(localDateEnd).minute();
    let targetAmEnd = splitDateEnd[4];

    // 打开日期选择器
    await page.waitFor('.datePicker', { visible: true });
    await page.waitForTimeout(1000);
    await page.click('.datePicker');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      let leftCalendar = document.querySelector('.left .calendar-table');
      let leftCalendartds = document.querySelectorAll('.left .calendar-table td.available');
      console.log('leftCalendar: ', leftCalendar);
      console.log('leftCalendartds: ', leftCalendartds.length);
      for (const iterator of leftCalendartds) {
        iterator.dataset.id = iterator.innerText;
      }
    });

    await page.waitFor('.left .month', { visible: true });
    const monthValue = await page.$eval('.left .month', el => el.innerText);

    // 不需要翻页,直接选择日期
    if (targetMonthValueStart == monthValue) {
      console.log('不需要翻页,直接选择日期');
      await page.waitFor('.left .calendar-table', { visible: true });

      // 选择点击天 需要点击两次日期 确认选择
      console.log('选择点击天', targetDayStart);
      let leftCalendartds = await page.$$('.left .calendar-table td.available:not(.off)');
      await leftCalendartds[targetDayStart - 1].click({ delay: 200 });
      await page.waitForTimeout(500);
      let leftCalendartds2 = await page.$$('.left .calendar-table td.available:not(.off)');
      await leftCalendartds2[targetDayStart - 1].click({ delay: 200 });
      // await page.waitForTimeout(1000);
      // await page.click(`.left .calendar-table td.available[data-id="${targetDay}"]`, { delay: 200 });

      // 打开时间选择框
      console.log('打开开始时间选择框');
      await page.click('.date-filter-header .start_time_label');

      // 向上与向下点击的时间选择按钮
      let upCartsStart = await page.$$('.start_time .up-caret');
      let downCartsStart = await page.$$('.start_time .down-caret');

      // 计算小时需要点击几下
      const start_hour = await page.$eval('.start_time .start_hour', el => el.innerText);
      let diffHourStart = start_hour - targetHourStart;
      let clickCountHourStart = Array(Math.abs(diffHourStart)).fill();
      if (diffHourStart < 0) {
        for (const iterator of clickCountHourStart) {
          await upCartsStart[0].click({ delay: 50 });
        }
      } else {
        for (const iterator of clickCountHourStart) {
          await downCartsStart[0].click({ delay: 50 });
        }
      }

      // 计算分钟需要点击几下
      const start_minute = await page.$eval('.start_time .start_minute', el => el.innerText);
      let diffMinuteStart = start_minute - targetMinuteStart;
      let clickCountMinute = Array(Math.abs(diffMinuteStart)).fill();
      if (diffMinuteStart < 0) {
        for (const iterator of clickCountMinute) {
          await upCartsStart[1].click({ delay: 10 });
        }
      } else {
        for (const iterator of clickCountMinute) {
          await downCartsStart[1].click({ delay: 10 });
        }
      }

      // 计算AM需要点击
      const start_meridiem = await page.$eval('.start_time .start_meridiem', el => el.innerText);
      if (start_meridiem !== targetAmStart) {
        await upCartsStart[2].click({ delay: 50 });
      }

      console.log('打开结束时间选择框');
      await page.click('.date-filter-header .end_time_label');

      // 向上与向下点击的时间选择按钮
      let upCartsEnd = await page.$$('.end_time .up-caret');
      let downCartsEnd = await page.$$('.end_time .down-caret');

      // 计算小时需要点击几下
      const end_hour = await page.$eval('.end_time .end_hour', el => el.innerText);
      let diffHourEnd = end_hour - targetHourEnd;
      let clickCountHourEnd = Array(Math.abs(diffHourEnd)).fill();
      if (diffHourEnd < 0) {
        for (const iterator of clickCountHourEnd) {
          await upCartsEnd[0].click({ delay: 50 });
        }
      } else {
        for (const iterator of clickCountHourEnd) {
          await downCartsEnd[0].click({ delay: 50 });
        }
      }

      // 计算分钟需要点击几下
      const end_minute = await page.$eval('.end_time .end_minute', el => el.innerText);
      let diffMinuteEnd = end_minute - targetMinuteEnd;
      let clickCountMinuteEnd = Array(Math.abs(diffMinuteEnd)).fill();
      if (diffMinuteEnd < 0) {
        for (const iterator of clickCountMinuteEnd) {
          await upCartsEnd[1].click({ delay: 10 });
        }
      } else {
        for (const iterator of clickCountMinuteEnd) {
          await downCartsEnd[1].click({ delay: 10 });
        }
      }

      // 计算AM需要点击
      const end_meridiem = await page.$eval('.end_time .end_meridiem', el => el.innerText);
      if (end_meridiem !== targetAmEnd) {
        await downCartsEnd[2].click({ delay: 50 });
      }

      const getAllHistory = (resolve, reject) => {
        page.on('response', response => {
          if (response.url().indexOf('allHistory') !== -1) {
            response.json().then(function(result) {
              if (result.success) {
                resolve(result);
              }
            });
          }
        });
      };

      let getAllHistoryHandle = new Promise(getAllHistory);

      await page.waitForTimeout(500);
      // 全部选择完成 点击确认进行查询
      await page.click('.end_time .time-select-btn');
      await page.click('.daterangepicker .date-select-btn');
      let result = await getAllHistoryHandle;
      // await page.close();
      return result;
    } else {
      return Promise.reject(new Error('日期格式有误'));
    }
  } catch (error) {
    console.log('errorerrorerror: ', error);
    await page.close();
    return Promise.reject(error);
  }
}
