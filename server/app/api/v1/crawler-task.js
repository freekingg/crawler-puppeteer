import { LinRouter, NotFound, disableLoading } from 'lin-mizar';
import { groupRequired, loginRequired } from '../../middleware/jwt';
import { TaskSearchValidator, CreateOrUpdateTaskValidator } from '../../validator/task';
import schedule from 'node-schedule';
import { hrtime } from 'process';
import { PositiveIdValidator } from '../../validator/common';

import { crawler } from '../../crawler';

import { getSafeParamId } from '../../lib/util';
import { TaskDao } from '../../dao/crawler-task';

import { CrawlerRunModel } from '../../model/crawler-run-log';
import { CrawlerTaskModel } from '../../model/crawler-task-log';

import { CrawlerTaskLogDao } from '../../dao/crawler-task-log';

const taskApi = new LinRouter({
  prefix: '/v1/task',
  module: '任务'
});

let taskJob = {};

const TaskDto = new TaskDao();
const CrawlerTaskLogDto = new CrawlerTaskLogDao();

const TaskHandle = async (implement, opt) => {
  let id = opt.id;
  const Instance = new crawler[implement](opt);

  CrawlerRunModel.createLog(
    {
      task_id: id,
      message: `${opt.title} 任务启动了`,
      status: 0
    },
    true
  );

  taskJob[`task${id}`] = {};
  taskJob[`task${id}`]['count'] = 0;
  taskJob[`task${id}`]['implement'] = Instance;
  taskJob[`task${id}`]['params'] = crawler[implement]['initParams'];

  taskJob[`task${id}`]['timer'] = schedule.scheduleJob(`${opt.time}`, function() {
    if (taskJob[`task${id}`]['runing']) return;
    taskJob[`task${id}`]['runing'] = true;
    taskJob[`task${id}`]['count'] += 1;
    let count = taskJob[`task${id}`]['count'];

    let newJobTime = JSON.parse(JSON.stringify(taskJob[`task${id}`]['params']));
    taskJob[`task${id}`]['params'] = crawler[implement].getParams(newJobTime);
    opt.params = taskJob[`task${id}`]['params'];

    const start = hrtime.bigint();
    Instance.start(opt)
      .then(res => {
        if (!res) return;
        console.log('任务成功');
        const end = hrtime.bigint();
        let duration = end - start;
        taskJob[`task${id}`]['runing'] = false;

        CrawlerRunModel.createLog(
          {
            task_id: id,
            task_index: count,
            duration,
            message: `${opt.title}: 定时任务执行成功,当前第${count}次`,
            status: 0
          },
          true
        );
        CrawlerTaskModel.createLog(
          {
            task_id: opt.id,
            task_index: count,
            params: JSON.stringify(taskJob[`task${id}`]['params']),
            status: 0,
            duration,
            message: `${opt.title}: 定时任务执行成功,当前第${count}次`
          },
          true
        ).then(async result => {
          let crawlerTaskId = result.id;
          let { list, info } = Instance.filterResult(res, crawlerTaskId, id);
          CrawlerTaskLogDto.updateItem(
            {
              task_id: opt.id,
              result: JSON.stringify(info || {}),
              status: 0
            },
            crawlerTaskId
          );
          for (const iterator of list) {
            await Instance.createItem(iterator);
          }
        });
      })
      .catch(error => {
        console.log('任务失败', error);

        const end = hrtime.bigint();
        let duration = end - start;

        taskJob[`task${id}`]['runing'] = false;
        CrawlerRunModel.createLog(
          {
            task_id: id,
            task_index: count,
            status: 1,
            duration,
            params: JSON.stringify(taskJob[`task${id}`]['params']),
            message: `${opt.title}: 定时任务执行失败,当前第${taskJob[`task${id}`]['count']}次--${error.message}`,
            errorStack: `${error.message},${error.stack},`
          },
          true
        );
        CrawlerTaskModel.createLog(
          {
            task_id: id,
            task_index: count,
            duration,
            params: JSON.stringify(taskJob[`task${id}`]['params']),
            status: 1,
            message: `${opt.title}: 定时任务执行失败,当前第${count}次--${error.message}`,
            errorStack: `${error.message},${error.stack},`
          },
          true
        );
      });
  });
};

// 初始化任务状态
TaskDto.getTasks().then(result => {
  for (const opt of result) {
    const implement = opt.implement;
    const status = opt.status;
    if (status === 2) {
      CrawlerRunModel.createLog(
        {
          task_id: opt.id,
          message: `服务重启,定时任务初始化 - ${opt.title}`,
          status: 0
        },
        true
      );
      TaskHandle(implement, opt);
    }
  }
});

taskApi.get('/:id', loginRequired, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const item = await TaskDto.getTask(id);
  if (!item) {
    throw new NotFound({
      code: 10022
    });
  }
  ctx.json(item);
});

taskApi.get('/', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const items = await TaskDto.getTasks(v);
  ctx.json(items);
});

taskApi.post('/', loginRequired, async ctx => {
  const v = await new CreateOrUpdateTaskValidator().validate(ctx);
  await TaskDto.createTask(v);
  ctx.success({
    code: 12
  });
});

taskApi.post('/auth/login', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const implement = opt.implement;

  let Instance = null;
  if (!crawler[implement]) {
    CrawlerRunModel.createLog(
      {
        task_id: opt.id,
        message: '实现类有误,或者不存在',
        status: 1
      },
      true
    );
    throw new NotFound({
      code: 10022,
      message: '实现类有误,或者不存在'
    });
  }

  Instance = new crawler[implement]();

  let authData = {};
  try {
    authData = await Instance.signin(opt);
    await TaskDto.updateTaskAuthData({ authData }, opt.id);
  } catch (error) {
    console.log(error);
    CrawlerRunModel.createLog(
      {
        task_id: opt.id,
        message: '登陆出错，请检查或者重试',
        errorStack: `${error.message},${error.stack}`,
        status: 1
      },
      true
    );
    Instance.close();
    throw new NotFound({
      code: 10022,
      message: '登陆出错，请检查或者重试'
    });
  }
  Instance.close();

  CrawlerRunModel.createLog(
    {
      task_id: opt.id,
      message: `${opt.title},网站登录成功`,
      status: 0
    },
    true
  );

  ctx.json({ authData });
});

taskApi.post('/start/task', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const id = opt.id;
  const implement = opt.implement;
  if (!crawler[implement]) {
    CrawlerRunModel.createLog(
      {
        task_id: id,
        message: '实现类有误,或者不存在',
        status: 1
      },
      true
    );
    throw new NotFound({
      code: 10022,
      message: '实现类有误,或者不存在'
    });
  }
  TaskHandle(implement, opt);
  ctx.success({
    code: 12
  });
});

taskApi.post('/start/task/test', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  let opts = opt;
  const implement = opt.implement;
  const Instance = new crawler[implement](opt);
  opts['params'] = crawler[implement]['initParams'];
  Instance.start(opts)
    .then(result => {
      console.log('result: ', result);
    })
    .catch(err => {
      console.log('err: ', err);
    });
  ctx.success({
    code: 12
  });
});

taskApi.post('/start/task/patch', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const id = opt.id;
  const implement = opt.implement;

  CrawlerRunModel.createLog(
    {
      task_id: id,
      message: `${opt.title} 补单任务启动了,参数 ${opt.extra.budanParams}`,
      status: 0
    },
    true
  );

  let opts = {
    ...opt,
    params: opt.extra ? JSON.parse(opt.extra).budanParams : {}
  };
  const Instance = new crawler[implement](opts);
  const start = hrtime.bigint();
  Instance.start(opts)
    .then(async res => {
      if (!res) return;
      const end = hrtime.bigint();
      let duration = end - start;
      // 任务执行完成，关闭实例
      Instance.close();

      CrawlerRunModel.createLog(
        {
          task_id: id,
          duration,
          message: `${opts.title}-${id} : 补单任务执行成功`,
          extra: opt.extra,
          status: 0
        },
        true
      );

      CrawlerTaskModel.createLog(
        {
          task_id: id,
          duration,
          params: JSON.stringify(opts.params),
          extra: opt.extra,
          status: 0,
          message: `${opts.title}: 补单任务执行成功`
        },
        true
      ).then(async result => {
        let crawlerTaskId = result.id;
        let { list, info } = Instance.filterResult(res, crawlerTaskId, id);
        CrawlerTaskLogDto.updateItem(
          {
            task_id: opt.id,
            result: JSON.stringify(info || {}),
            status: 0
          },
          crawlerTaskId
        );
        for (const iterator of list) {
          await Instance.createItem(iterator);
        }
      });
    })
    .catch(error => {
      // 任务执行完成，关闭实例
      Instance.close();
      const end = hrtime.bigint();
      let duration = end - start;
      CrawlerRunModel.createLog(
        {
          task_id: id,
          status: 1,
          duration,
          params: JSON.stringify(opts.params),
          extra: opt.extra,
          message: `${opt.title}: 补单任务执行失败: ${error.message}`,
          errorStack: `${error.message},${error.stack},`
        },
        true
      );
      CrawlerTaskModel.createLog(
        {
          task_id: id,
          duration,
          message: `${opt.title}: 补单任务执行失败: ${error.message}`,
          status: 1,
          params: JSON.stringify(opts.params),
          extra: opt.extra,
          errorStack: `${error.message},${error.stack},`
        },
        true
      );
    });

  ctx.success({
    code: 12
  });
});

// 重试任务
taskApi.post('/start/retask', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const id = opt.id;
  const { crawler_task } = opt;
  const implement = crawler_task.implement;
  let opts = {
    ...opt.crawler_task,
    params: opt.params ? JSON.parse(opt.params) : {}
  };
  CrawlerRunModel.createLog(
    {
      task_id: crawler_task.id,
      task_index: opt.task_index,
      message: `${crawler_task.title}-${opt.id} 异常任务开始重新执行了`,
      status: 0
    },
    true
  );

  const Instance = new crawler[implement](opts);
  const start = hrtime.bigint();
  Instance.start(opts)
    .then(async res => {
      if (!res) return;
      const end = hrtime.bigint();
      let duration = end - start;

      CrawlerRunModel.createLog(
        {
          task_id: crawler_task.id,
          duration,
          task_index: opt.task_index,
          message: `${crawler_task.title}-${id} : 异常任务重新执行成功了`,
          status: 0
        },
        true
      );

      await CrawlerTaskLogDto.updateItem(
        {
          task_id: crawler_task.id,
          status: 0,
          duration,
          message: `${crawler_task.title}-${id} : 异常任务重新执行成功了`
        },
        opt.id
      );

      // 任务执行完成，关闭实例
      Instance.close();

      let crawlerTaskId = opt.id;
      let { list, info } = Instance.filterResult(res, crawlerTaskId, crawler_task.id);
      CrawlerTaskLogDto.updateItem(
        {
          task_id: crawler_task.id,
          result: JSON.stringify(info || {}),
          status: 0
        },
        crawlerTaskId
      );
      for (const iterator of list) {
        await Instance.createItem(iterator);
      }
    })
    .catch(error => {
      console.log('任务失败', error);
      const end = hrtime.bigint();
      let duration = end - start;
      CrawlerRunModel.createLog(
        {
          task_id: crawler_task.id,
          task_index: opt.task_index,
          duration,
          message: `${crawler_task.title}-${opt.id}: 异常任务重新执行还是失败,${error.message}`,
          status: 1
        },
        true
      );
      // 任务执行完成，关闭实例
      Instance.close();
    });
  ctx.success({
    code: 12
  });
});

taskApi.post('/stop/task', async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const id = opt.id;

  if (!taskJob[`task${id}`]) {
    TaskDto.updateTaskStatus({ status: 1 }, id);
  } else {
    try {
      taskJob[`task${id}`]['timer'].cancel();
      taskJob[`task${id}`]['runing'] = false;
    } catch (error) {
      console.log('任务停止失败', error);
      CrawlerRunModel.createLog(
        {
          task_id: id,
          status: 1,
          extra: opt.extra,
          message: `${opt.title}: 任务停止失败: ${error.message}`,
          errorStack: `${error.message},${error.stack},`
        },
        true
      );
    }
    TaskDto.updateTaskStatus({ status: 1 }, id);
  }
  taskJob[`task${id}`]['implement'].close();
  CrawlerRunModel.createLog(
    {
      task_id: id,
      message: `${opt.title}:定时任务停止`,
      status: 0
    },
    true
  );

  ctx.success({
    code: 12
  });
});

taskApi.put('/:id', async ctx => {
  const v = await new CreateOrUpdateTaskValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await TaskDto.updateTask(v, id);
  ctx.success({
    code: 13
  });
});

taskApi.linDelete('deleteTask', '/:id', taskApi.permission('删除任务'), groupRequired, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  await TaskDto.deleteTask(id);
  ctx.success({
    code: 14
  });
});

module.exports = { taskApi, [disableLoading]: false };
