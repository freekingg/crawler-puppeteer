/*
 * @Author: your name
 * @Date: 2021-11-30 10:10:29
 * @LastEditTime: 2021-12-10 11:35:41
 * @LastEditors: your name
 * @FilePath: \tg-helps\server\app\lib\util.js
 */
import { toSafeInteger, get, isInteger } from 'lodash';
import { ParametersException } from 'lin-mizar';
import fs from 'fs';

function getSafeParamId(ctx) {
  const id = toSafeInteger(get(ctx.params, 'id'));
  if (!isInteger(id)) {
    throw new ParametersException({
      code: 10030
    });
  }
  return id;
}

function isOptional(val) {
  // undefined , null , ""  , "    ", 皆通过
  if (val === undefined) {
    return true;
  }
  if (val === null) {
    return true;
  }
  if (typeof val === 'string') {
    return val === '' || val.trim() === '';
  }
  return false;
}

// 根据路径判断文件是否存在
function isFileExisted(filePath) {
  return new Promise(function(resolve) {
    fs.access(filePath, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// 根据秒返回时分秒
function dataForSeconds(totalSeconds = 3600) {
  let hour = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minute = Math.floor(totalSeconds / 60);
  let second = totalSeconds % 60;
  return {
    hour,
    minute,
    second
  };
}

// 判断是否为空对象
function isEmptyObject(data) {
  if (!data) return {};
  let obj = {};
  try {
    obj = JSON.parse(data);
  } catch (error) {
    return false;
  }
  let arr = Object.keys(obj);
  return arr.length ? obj : {};
}

// 数组转字符串cookie  [{name:_ga,value:GA1.2.}] => _ga=GA1.2.642251812.1615036211;
function parseCookie(cookies) {
  if (!cookies && !cookies.length) return '';
  let cookieStr = '';
  for (const cookie of cookies) {
    cookieStr += cookie.name + '=' + cookie.value + '; ';
  }
  return cookieStr;
}

export { isEmptyObject, parseCookie, getSafeParamId, isOptional, isFileExisted, dataForSeconds };
