import { LinRouter, NotFound, disableLoading } from 'lin-mizar';
import { groupRequired, loginRequired } from '../../middleware/jwt';
import { TaskSearchValidator, CreateOrUpdateTaskValidator } from '../../validator/task';
import schedule from 'node-schedule';
import { PositiveIdValidator } from '../../validator/common';

import { crawler } from '../../crawler';

import { getSafeParamId } from '../../lib/util';
import { TaskDao } from '../../dao/crawler-task';

import { CrawlerRunModel } from '../../model/crawler-run-log';
import { CrawlerTaskModel } from '../../model/crawler-task-log';

const taskApi = new LinRouter({
  prefix: '/v1/task',
  module: '任务'
});

let taskJob = {};

const TaskDto = new TaskDao();

const TaskHandle = (implement, opt) => {
  let id = opt.id;
  const Instance = new crawler[implement](opt);
  // await Instance.start(opt);

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
  taskJob[`task${id}`]['timer'] = schedule.scheduleJob(`${opt.time}`, function() {
    if (taskJob[`task${id}`]['runing']) return;
    taskJob[`task${id}`]['runing'] = true;
    taskJob[`task${id}`]['count'] += 1;
    let count = taskJob[`task${id}`]['count'];
    Instance.start(opt)
      .then(res => {
        console.log('任务成功', res);
        if (res.status) {
          taskJob[`task${id}`]['runing'] = false;
          CrawlerRunModel.createLog(
            {
              task_id: id,
              task_index: count,
              message: `${opt.title}: 定时任务执行成功,当前第${count}次`,
              status: 0
            },
            true
          );
          CrawlerTaskModel.createLog(
            {
              task_id: opt.id,
              task_index: count,
              params: JSON.stringify({
                startTime: '2020-10-10',
                endTime: '2020-10-11'
              }),
              result: JSON.stringify({
                total: 20
              }),
              status: 0,
              message: `${opt.title}: 定时任务执行成功,当前第${count}次`
            },
            true
          );
        } else {
        }
      })
      .catch(error => {
        console.log('任务失败', error);
        taskJob[`task${id}`]['runing'] = false;
        CrawlerRunModel.createLog(
          {
            task_id: id,
            task_index: count,
            status: 1,
            message: `${opt.title}: 定时任务执行失败,当前第${taskJob[`task${id}`]['count']}次--${error.message}`,
            errorStack: `${error.message},${error.stack},`
          },
          true
        );
        CrawlerTaskModel.createLog(
          {
            task_id: opt.id,
            task_index: count,
            params: JSON.stringify({
              startTime: '2020-10-10',
              endTime: '2020-10-11'
            }),
            result: JSON.stringify({
              total: 20
            }),
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

taskApi.get('/search/one', loginRequired, async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const item = await TaskDto.getTaskByKeyword(v.get('query.q'));
  if (!item) {
    throw new NotFound();
  }
  ctx.json(item);
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

    throw new NotFound({
      code: 10022,
      message: '登陆出错，请检查或者重试'
    });
  }
  ctx.json({ authData });
});

taskApi.post('/start/irrigation', loginRequired, async ctx => {
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

taskApi.post('/stop/irrigation', async ctx => {
  const v = await new TaskSearchValidator().validate(ctx);
  const opt = v.get('body');
  const id = opt.id;

  if (!taskJob[`task${id}`]) {
    TaskDto.updateTaskStatus({ status: 1 }, id);
  } else {
    taskJob[`task${id}`]['timer'].cancel();
    taskJob[`task${id}`]['runing'] = false;
  }

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
