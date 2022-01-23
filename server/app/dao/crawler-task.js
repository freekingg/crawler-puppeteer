import { NotFound, Forbidden } from 'lin-mizar';
import Sequelize from 'sequelize';
import { CrawlerTask as Task } from '../model/crawler-task';

class TaskDao {
  async getTask (id) {
    const item = await Task.findOne({
      where: {
        id
      }
    });
    return item;
  }

  async getTaskByKeyword (q) {
    const item = await Task.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        }
      }
    });
    return item;
  }

  async getTasks () {
    const condition = {};
    const items = await Task.findAll({
      where: Object.assign({}, condition),
      order: [['create_time', 'DESC']]
    });
    return items;
  }

  async createTask (v) {
    const item = await Task.findOne({
      where: {
        title: v.get('body.title')
      }
    });
    if (item) {
      throw new Forbidden({
        code: 10240
      });
    }
    const bk = new Task();
    bk.title = v.get('body.title');
    bk.url = v.get('body.url');
    bk.implement = v.get('body.implement');
    bk.implementPre = v.get('body.implementPre');
    bk.time = v.get('body.time');
    bk.proxyType = v.get('body.proxyType');
    bk.proxyIp = v.get('body.proxyIp');
    bk.account = v.get('body.account');
    bk.pwd = v.get('body.pwd');
    bk.status = v.get('body.status');
    bk.summary = v.get('body.summary');
    bk.authData = v.get('body.authData');
    bk.extra = v.get('body.extra');
    await bk.save();
  }

  async updateTask (v, id) {
    const item = await Task.findByPk(id);
    if (!item) {
      throw new NotFound({
        code: 10022
      });
    }
    item.title = v.get('body.title');
    item.url = v.get('body.url');
    item.implement = v.get('body.implement');
    item.implementPre = v.get('body.implementPre');
    item.time = v.get('body.time');
    item.proxyType = v.get('body.proxyType');
    item.proxyIp = v.get('body.proxyIp');
    item.account = v.get('body.account');
    item.pwd = v.get('body.pwd');
    item.status = v.get('body.status');
    item.summary = v.get('body.summary');
    item.authData = v.get('body.authData');
    item.extra = v.get('body.extra');
    await item.save();
  }

  async updateTaskStatus ({ status }, id) {
    const item = await Task.findByPk(id);
    if (!item) {
      throw new NotFound({
        code: 10022
      });
    }
    item.status = status;
    await item.save();
  }

  async updateTaskAuthData ({ authData }, id) {
    const item = await Task.findByPk(id);
    if (!item) {
      throw new NotFound({
        code: 10022
      });
    }
    item.authData = JSON.stringify(authData);
    await item.save();
  }

  async deleteTask (id) {
    const item = await Task.findOne({
      where: {
        id
      }
    });
    if (!item) {
      throw new NotFound({
        code: 10022
      });
    }
    await item.destroy();
  }
}

export { TaskDao };
