import { NotFound, Forbidden } from 'lin-mizar';
import { set } from 'lodash';

import { CrawlerTaskModel as Modals } from '../model/crawler-task-log';
import { CrawlerTask } from '../model/crawler-task';

class CrawlerTaskLogDao {
  async getItem (id) {
    const item = await Modals.findOne({
      where: {
        id
      },
      include: [
        {
          model: CrawlerTask,
          as: 'crawler_task'
        }
      ]
    });
    return item;
  }

  async getItems (v) {
    const condition = {};
    const page = v.get('query.page');
    const limit = v.get('query.count');
    v.get('query.task_id') && set(condition, 'task_id', v.get('query.task_id'));
    v.get('query.status') && set(condition, 'status', v.get('query.status'));
    const { rows, count } = await Modals.findAndCountAll({
      where: Object.assign({}, condition),
      include: [
        {
          model: CrawlerTask,
          as: 'crawler_task'
        }
      ],
      order: [['create_time', 'DESC']],
      offset: page * limit,
      limit: limit
    });
    return {
      list: rows,
      total: count
    };
  }
}

export { CrawlerTaskLogDao };
