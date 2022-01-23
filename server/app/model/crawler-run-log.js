import { Model, Sequelize } from 'sequelize';
import { InfoCrudMixin } from 'lin-mizar';
import sequelize from '../lib/db';
import { merge } from 'lodash';
import { CrawlerTask as CrawlerTaskModals } from './crawler-task';

class CrawlerRunModel extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      task_id: this.task_id,
      task_index: this.task_index,
      message: this.message,
      create_time: this.create_time,
      status: this.status,
      errorStack: this.errorStack,
      extra: this.extra,
      crawler_task: this.crawler_task
    };
    return origin;
  }

  static createLog (args, commit) {
    const log = CrawlerRunModel.build(args);
    commit && log.save();
    return log;
  }
}

CrawlerRunModel.init(
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
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT('long')
    },
    errorStack: {
      type: Sequelize.TEXT('long')
    },
    extra: {
      type: Sequelize.STRING(1000),
      allowNull: true
    },
    status: {
      type: Sequelize.BOOLEAN,
      comment: '0：成功 1：异常',
      defaultValue: 1
    }
  },
  merge(
    {
      sequelize,
      tableName: 'crawler_run_log',
      modelName: 'crawler_run_log'
    },
    InfoCrudMixin.options
  )
);
CrawlerRunModel.belongsTo(CrawlerTaskModals, { foreignKey: 'task_id', targetKey: 'id' });
export { CrawlerRunModel };
