import { InfoCrudMixin } from 'lin-mizar';
import { merge } from 'lodash';
import { Sequelize, Model } from 'sequelize';
import sequelize from '../lib/db';

class Task extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      title: this.title,
      accounts: this.accounts,
      contentData: this.contentData,
      status: this.status,
      time: this.time,
      summary: this.summary,
      extra: this.extra,
      create_time: this.create_time
    };
    return origin;
  }
}

Task.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    time: {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 60
    },
    accounts: {
      type: Sequelize.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue('accounts'));
      },
      set: function (val) {
        return this.setDataValue('accounts', JSON.stringify(val));
      },
      defaultValue: [],
      comment: '关联的帐号ids'
    },
    contentData: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: '发送的内容'
    },
    type: {
      type: Sequelize.INTEGER(2),
      defaultValue: 1,
      comment: '类型 1：灌水类型 2：冒泡模式'
    },
    status: {
      type: Sequelize.INTEGER(2),
      defaultValue: 1,
      comment: '状态 1：停止 2：进行中'
    },
    extra: {
      type: Sequelize.STRING(1000),
      allowNull: true
    },
    summary: {
      type: Sequelize.STRING(1000),
      allowNull: true
    }
  },
  merge(
    {
      sequelize,
      tableName: 'task',
      modelName: 'task'
    },
    InfoCrudMixin.options
  )
);
export { Task };
