<h1 align="center">
  <br>
  部署说明
</h1>

## 简介
spider 服务端部署说明
### Server 端必备环境

依赖 Node.js 环境，在使用前请确保你已经搭建好了 Node 的环境，且版本 保证在v8.14.0以上

- 安装 MySQL（version： 5.6+）

- 安装 Node.js环境 (version： 8.14.0+)

- pm2进程管理器

### 安装依赖包
``` js
npm install
```

**安装pm2进程守护**
```
npm install -g pm2
```

### 数据库配置
需要在 MySQL 中新建一个数据库，名字由你自己决定。例如，新建一个名为 lin-cms 的数据库，数据库字符编码设置为utf8mb4。接着，我们需要在工程中进行一项 简单的配置。使用编辑器打开工程的app/config/secure.js，找到如下配置项：
```
module.exports = {
  db: {
    database: "lin-cms",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    logging: false
  }
};
```
**请在db这项中配置 MySQL 数据库的用户名、密码、ip、端口号与数据库名。请务必根 据自己的实际情况修改此配置项。**

### 导入数据
数据库配置完成后需要导入数据，在你的开发环境 RDBMS 中，新建一个数据库，数据库名应当和上面配置的`database`字段相同，如`lin-cms`。

然后找到根目录下的`/spider.sql`文件，并在 MySQL 中执行该脚本文件。

推荐你使用 navicat 等数据库工具导入并执行脚本文件，如果你熟悉 mysql 客户端工具， 也可使用它导入数据。

### 运行

**开发环境**
```
npm run start:dev
```

**生产环境**
```
npm run start:pm2
```

如果一切顺利，你将在命令行中看到项目成功运行的信息。如果你没有修改代码，Lin 将默 认在本地启动一个端口号为 5000 的端口用来监听请求。此时，我们访问http://localhost:5000，

这证明你已经成功的运行起来了，Congratulations！

### 常用操作

#### pm2进程管理器
PM2 是一个带有负载均衡功能的 Node 应用进程管理器。

![](https://gitee.com/king121314/king-static/raw/master/20210725141040.png)

**主要特性：**

- 内建负载均衡（使用 Node cluster 集群模块）
- 后台运行
- 0 秒停机重载
- 停止不稳定的进程（避免无限循环）
- 具有 Ubuntu 和 CentOS 的启动脚本

#### 常用命令

- 启动服务

```
pm2 start ecosystem.config.js //根据配置文件启动
pm2 start app.js //启动app.js应用
pm2 restart app.js //重新启动app.js应用
```

- 停止服务
```
pm2 stop all               //停止所有应用
pm2 stop [AppName]        //根据应用名停止指定应用
pm2 stop [ID]             //根据应用id停止指定应用
```

- 删除应用
```
pm2 delete all               //关闭并删除应用
pm2 delete [AppName]        //根据应用名关闭并删除应用
pm2 delete [ID]            //根据应用ID关闭并删除应用

```


- 创建开机自启动
```
pm2 startup
```

```
- 查看启动列表
```
pm2 list
```

- 查看每个应用程序占用情况
```
pm2 monit
```

- 日志查看
```
pm2 logs            //查看所有应用日志
pm2 logs [Name]    //根据指定应用名查看应用日志
pm2 logs [ID]      //根据指定应用ID查看应用日志
```

```
pm2 kill
rm -rf ~/.pm2 
```