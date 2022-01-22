import { InfoCrudMixin } from 'lin-mizar';
import { merge } from 'lodash';
import { Sequelize, Model } from 'sequelize';
import sequelize from '../lib/db';

class Account extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      phone: this.phone,
      pwd: this.pwd,
      authData: this.authData,
      status: this.status,
      implement: this.implement,
      url: this.url,
      summary: this.summary,
      extra: this.extra,
      create_time: this.create_time
    };
    return origin;
  }
}

Account.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    pwd: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    authData: {
      type: Sequelize.TEXT('long'),
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER(2),
      defaultValue: 1,
      comment: '状态 1：未登录 2：已登录 3：任务中'
    },
    implement: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    url: {
      type: Sequelize.STRING(100),
      allowNull: true
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
      tableName: 'account',
      modelName: 'account'
    },
    InfoCrudMixin.options
  )
);

export { Account };
