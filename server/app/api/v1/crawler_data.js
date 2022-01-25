import { LinRouter, NotFound, disableLoading } from 'lin-mizar';
import { TaskSearchValidator } from '../../validator/task';

import { CrawlerDataDao } from '../../dao/crawler-data';

const taskDataApi = new LinRouter({
  prefix: '/v1/crawler/task/data',
  module: '爬取数据'
});

const TaskDataDto = new CrawlerDataDao();

taskDataApi.get('/:id', async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const id = v.get('path.id');
  const item = await TaskDataDto.getItem(id);
  if (!item) {
    throw new NotFound({
      code: 10022
    });
  }
  ctx.json(item);
});

taskDataApi.get('/', async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const items = await TaskDataDto.getItems(v);
  ctx.json(items);
});

module.exports = { taskDataApi, [disableLoading]: false };
