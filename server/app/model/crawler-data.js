import { InfoCrudMixin } from 'lin-mizar';
import { merge } from 'lodash';
import { Sequelize, Model } from 'sequelize';
import sequelize from '../lib/db';
import { CrawlerTaskModel } from './crawler-task-log';

class CrawlerData extends Model {
  toJSON() {
    const origin = {
      id: this.id,
      receivedFrom: this.receivedFrom,
      utrId: this.utrId,
      vpaId: this.vpaId,
      orderId: this.orderId,
      amount: this.amount,
      crawlerTaskId: this.crawlerTaskId,
      tradeTime: this.tradeTime,
      extra: this.extra,
      create_time: this.create_time,
      crawler_task_log: this.crawler_task_log
    };
    return origin;
  }
}

CrawlerData.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    receivedFrom: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    utrId: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    vpaId: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    orderId: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    amount: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    crawlerTaskId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    tradeTime: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    extra: {
      type: Sequelize.STRING(1000),
      allowNull: true
    }
  },
  merge(
    {
      sequelize,
      tableName: 'crawler_data',
      modelName: 'crawler_data',
      indexes: [
        {
          name: 'utrId_del',
          unique: true,
          fields: ['utrId', 'delete_time']
        }
      ]
    },
    InfoCrudMixin.options
  )
);
CrawlerData.belongsTo(CrawlerTaskModel, { foreignKey: 'crawlerTaskId', targetKey: 'id' });
export { CrawlerData };
