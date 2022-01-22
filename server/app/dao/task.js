import { NotFound, Forbidden } from 'lin-mizar';
import Sequelize from 'sequelize';
import { set } from 'lodash';
import { Task } from '../model/task';
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

  async getTasks (v) {
    const condition = {};
    v.get('query.type') && set(condition, 'type', v.get('query.type'));

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
    bk.accounts = v.get('body.accounts');
    bk.contentData = v.get('body.contentData');
    bk.status = v.get('body.status');
    bk.type = v.get('body.type');
    bk.time = v.get('body.time');
    bk.summary = v.get('body.summary');
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
    item.accounts = v.get('body.accounts');
    item.contentData = v.get('body.contentData');
    item.status = v.get('body.status');
    item.type = v.get('body.type');
    item.time = v.get('body.time');
    item.summary = v.get('body.summary');
    item.extra = v.get('body.extra');
    await item.save();
  }

  async updateTaskAuthData ({ authData }, id) {
    console.log('id: ', id);
    const item = await Task.findByPk(id);
    console.log('item: ', item);
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
