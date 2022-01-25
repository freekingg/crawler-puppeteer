import { NotFound, Forbidden } from 'lin-mizar';
import { set } from 'lodash';

import { CrawlerTaskModel as Modals } from '../model/crawler-task-log';
import { CrawlerTask } from '../model/crawler-task';

class CrawlerTaskLogDao {
  async getItem(id) {
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

  async getItems(v) {
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

  async updateItem(body, id) {
    const item = await Modals.findByPk(id);
    if (!item) {
      throw new NotFound({
        code: 10022
      });
    }
    item.task_id = body.task_id;
    item.task_index = body.task_index;
    item.params = body.params;
    item.result = body.result;
    item.status = body.status;
    item.message = body.message;
    await item.save();
  }
}

export { CrawlerTaskLogDao };
