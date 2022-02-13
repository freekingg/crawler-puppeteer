import { PuppeteerTest } from './test';
import { PuppeteerBharatpe } from './bharatpe';
import { PuppeteerYesbank } from './yesbank';
import fs from 'fs-extra';
import path from 'path';
// 创建日志目录
fs.ensureDir(path.join(__dirname, '/log'), function() {});

let crawler = { PuppeteerTest, PuppeteerBharatpe, PuppeteerYesbank };
export { crawler };
