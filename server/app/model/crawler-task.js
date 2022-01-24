import { InfoCrudMixin } from 'lin-mizar';
import { merge } from 'lodash';
import { Sequelize, Model } from 'sequelize';
import sequelize from '../lib/db';

class CrawlerTask extends Model {
  toJSON() {
    const origin = {
      id: this.id,
      title: this.title,
      url: this.url,
      implement: this.implement,
      implementPre: this.implementPre,
      time: this.time,
      proxyType: this.proxyType,
      proxyIp: this.proxyIp,
      account: this.account,
      pwd: this.pwd,
      status: this.status,
      summary: this.summary,
      authData: this.authData,
      extra: this.extra,
      create_time: this.create_time
    };
    return origin;
  }
}

CrawlerTask.init(
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
      type: Sequelize.STRING(100),
      allowNull: true
    },
    url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    implement: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    implementPre: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    proxyType: {
      type: Sequelize.INTEGER(2),
      defaultValue: 4,
      comment: '类型 1：http代理 2：socks5代理 3：其它 4 ：不使用'
    },
    proxyIp: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    account: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    pwd: {
      type: Sequelize.STRING(100),
      allowNull: true
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
    },
    authData: {
      type: Sequelize.TEXT('long'),
      allowNull: true
    }
  },
  merge(
    {
      sequelize,
      tableName: 'crawler_task',
      modelName: 'crawler_task'
    },
    InfoCrudMixin.options
  )
);
export { CrawlerTask };
