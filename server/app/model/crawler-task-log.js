import { Model, Sequelize } from 'sequelize';
import { InfoCrudMixin } from 'lin-mizar';
import sequelize from '../lib/db';
import { merge } from 'lodash';
import { CrawlerTask as CrawlerTaskModals } from './crawler-task';

class CrawlerTaskModel extends Model {
  toJSON() {
    const origin = {
      id: this.id,
      task_id: this.task_id,
      task_index: this.task_index,
      message: this.message,
      params: this.params,
      result: this.result,
      index: this.index,
      create_time: this.create_time,
      status: this.status,
      errorStack: this.errorStack,
      extra: this.extra,
      crawler_task: this.crawler_task
    };
    return origin;
  }

  static async createLog(args, commit) {
    const log = CrawlerTaskModel.build(args);
    commit && (await log.save());
    return log;
  }
}

CrawlerTaskModel.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    task_index: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    message: {
      type: Sequelize.TEXT('long')
    },
    errorStack: {
      type: Sequelize.TEXT('long')
    },
    params: {
      type: Sequelize.STRING(1000),
      allowNull: true
    },
    result: {
      type: Sequelize.STRING(1000),
      allowNull: true
    },
    extra: {
      type: Sequelize.STRING(1000),
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER(2),
      defaultValue: 0,
      comment: '0：成功 1：异常'
    }
  },
  merge(
    {
      sequelize,
      tableName: 'crawler_task_log',
      modelName: 'crawler_task_log'
    },
    InfoCrudMixin.options
  )
);
CrawlerTaskModel.belongsTo(CrawlerTaskModals, { foreignKey: 'task_id', targetKey: 'id' });
export { CrawlerTaskModel };
