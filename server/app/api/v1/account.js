import { LinRouter, NotFound, disableLoading,config } from 'lin-mizar';
import path from "path";
import { groupRequired } from '../../middleware/jwt';
import {
  AccountSearchValidator,
  CreateOrUpdateAccountValidator
} from '../../validator/account';
import { PositiveIdValidator } from '../../validator/common';

import PuppeteerTelegram from '../../lib/tg'

import { getSafeParamId, isFileExisted } from '../../lib/util';
import { AccountDao } from '../../dao/account';

const accountApi = new LinRouter({
  prefix: '/v1/account',
  module: '帐号'
});

const AccountDto = new AccountDao();

accountApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const item = await AccountDto.getAccount(id);
  if (!item) {
    throw new NotFound({
      code: 10022
    });
  }
  ctx.json(item);
});

accountApi.get('/', async ctx => {
  const items = await AccountDto.getAccounts();
  // if (!books || books.length < 1) {
  //   throw new NotFound({
  //     message: '没有找到相关书籍'
  //   });
  // }
  ctx.json(items);
});

accountApi.get('/auth/login', async ctx => {
  const v = await new AccountSearchValidator().validate(ctx);
  const account = v.get('query.phone')
  const id = v.get('query.id')
  const authData = await PuppeteerTelegram.signin(account);
  await AccountDto.updateAccountAuthData({ authData }, id);
  const groups = await PuppeteerTelegram.getGroups(authData);
  await AccountDto.updateAccountGroups({ groups }, id);
  ctx.json({ authData });
});

// 获取登录的二维码
accountApi.get('/auth/loginQr', async ctx => {
  const v = await new AccountSearchValidator().validate(ctx);
  let account = v.get('query.phone')
  let baseDir = config.getItem('baseDir')
  const siteDomain = config.getItem('siteDomain');
  let screenPath = path.join(baseDir, 'assets/screenshot', `${account}.png`)
  console.log('screenPath: ', screenPath);
  let isExisted = await isFileExisted(screenPath)
  let imgPath = ''
  if (isExisted) {
    imgPath = `${siteDomain}/assets/screenshot/${account}.png`
    console.log('imgPath: ', imgPath);
  }

  ctx.json({
    path: imgPath
  });
  // const items = await PuppeteerTelegram.signin(account);
  // console.log('items: ', items);
  // if (!items) {
  //   throw new NotFound();
  // }
  // ctx.json(items);
});

accountApi.get('/search/one', async ctx => {
  const v = await new AccountSearchValidator().validate(ctx);
  const item = await AccountDto.getAccountByKeyword(v.get('query.q'));
  if (!item) {
    throw new NotFound();
  }
  ctx.json(item);
});

accountApi.post('/', async ctx => {
  const v = await new CreateOrUpdateAccountValidator().validate(ctx);
  await AccountDto.createAccount(v);
  ctx.success({
    code: 12
  });
});

accountApi.put('/:id', async ctx => {
  const v = await new CreateOrUpdateAccountValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await AccountDto.updateAccount(v, id);
  ctx.success({
    code: 13
  });
});

accountApi.linDelete(
  'deleteAccount',
  '/:id',
  accountApi.permission('删除帐号'),
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await AccountDto.deleteAccount(id);
    ctx.success({
      code: 14
    });
  }
);

module.exports = { accountApi, [disableLoading]: false };
