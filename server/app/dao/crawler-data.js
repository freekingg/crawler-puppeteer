import { set } from 'lodash';
import { CrawlerData as Modals } from '../model/crawler-data';
import { CrawlerTaskModel } from '../model/crawler-task-log';

class CrawlerDataDao {
  async getItem(id) {
    const item = await Modals.findOne({
      where: {
        id
      },
      include: [
        {
          model: CrawlerTaskModel,
          as: 'crawler_task_log'
        }
      ]
    });
    return item;
  }

  async getItems(v) {
    const condition = {};
    const page = v.get('query.page');
    const limit = v.get('query.count');
    v.get('query.crawlerTaskId') && set(condition, 'crawlerTaskId', v.get('query.crawlerTaskId'));
    const { rows, count } = await Modals.findAndCountAll({
      where: Object.assign({}, condition),
      include: [
        {
          model: CrawlerTaskModel,
          as: 'crawler_task_log'
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

  async createItem(body) {
    const item = await Modals.findOne({
      where: {
        utrId: body.utrId
      }
    });
    if (item) {
      console.log('已存在');
      this.updateItem(item, body);
    }
    const bk = new Modals();
    bk.receivedFrom = body.receivedFrom;
    bk.utrId = body.utrId;
    bk.vpaId = body.vpaId;
    bk.orderId = body.orderId;
    bk.amount = body.amount;
    bk.crawlerTaskId = body.crawlerTaskId;
    bk.tradeTime = body.tradeTime;
    bk.extra = body.extra;
    await bk.save();
  }

  async updateItem(item, body) {
    const bk = item;
    bk.receivedFrom = body.receivedFrom;
    bk.utrId = body.utrId;
    bk.vpaId = body.vpaId;
    bk.orderId = body.orderId;
    bk.amount = body.amount;
    bk.crawlerTaskId = body.crawlerTaskId;
    bk.tradeTime = body.tradeTime;
    bk.extra = body.extra;
    await bk.save();
  }
}

export { CrawlerDataDao };
