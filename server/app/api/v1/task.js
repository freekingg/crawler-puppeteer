import { LinRouter, NotFound, disableLoading } from "lin-mizar";
import { groupRequired } from "../../middleware/jwt";
import {
  TaskSearchValidator,
  CreateOrUpdateTaskValidator,
} from "../../validator/task";
import schedule from "node-schedule";
import { PositiveIdValidator } from "../../validator/common";
import PuppeteerTelegram from "../../lib/tg";
import { getSafeParamId, dataForSeconds } from "../../lib/util";
import { TaskDao } from "../../dao/task";

const taskApi = new LinRouter({
  prefix: "/v1/task",
  module: "任务",
});

let taskJob = {};

const TaskDto = new TaskDao();

taskApi.get("/:id", async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get("path.id");
  const item = await TaskDto.getTask(id);
  if (!item) {
    throw new NotFound({
      code: 10022,
    });
  }
  ctx.json(item);
});

taskApi.get("/", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const items = await TaskDto.getTasks(v);
  ctx.json(items);
});

taskApi.get("/search/one", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const item = await TaskDto.getTaskByKeyword(v.get("query.q"));
  if (!item) {
    throw new NotFound();
  }
  ctx.json(item);
});

taskApi.post("/", async (ctx) => {
  const v = await new CreateOrUpdateTaskValidator().validate(ctx);
  await TaskDto.createTask(v);
  ctx.success({
    code: 12,
  });
});

taskApi.post("/start/irrigation", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const id = v.get("body.id");
  const item = await TaskDto.getTask(id);

  let { hour, minute, second } = dataForSeconds(item.time);
  let dateJob = {};
  hour && (dateJob.hour = hour);
  minute && (dateJob.minute = minute);
  second && (dateJob.second = second);
  taskJob[`task${item.id}`] = {};
  taskJob[`task${item.id}`]["runing"] = true;
  console.log('object,dateJob',dateJob);
  taskJob[`task${item.id}`]["timer"] = schedule.scheduleJob(
    dateJob,
    function() {
      console.log('开始执行了');
      if (taskJob[`task${item.id}`]["runing"]) return;
      let puppeteer = new PuppeteerTelegram();
      taskJob[`task${item.id}`]["runing"] = true;
      puppeteer.irrigationTask(item).then(() => {
        taskJob[`task${item.id}`]["runing"] = false;
      });
    }
  );

  let puppeteer = new PuppeteerTelegram();
  puppeteer.irrigationTask(item).then(() => {
    taskJob[`task${item.id}`]["runing"] = false;
  });

  ctx.success({
    code: 12,
  });
});

taskApi.post("/stop/irrigation", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const id = v.get("body.id");
  const item = await TaskDto.getTask(id);
  taskJob[`task${item.id}`]["timer"].cancel();
  taskJob[`task${item.id}`]["runing"] = false;
  ctx.success({
    code: 12,
  });
});

taskApi.put("/:id", async (ctx) => {
  const v = await new CreateOrUpdateTaskValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await TaskDto.updateTask(v, id);
  ctx.success({
    code: 13,
  });
});

taskApi.linDelete(
  "deleteTask",
  "/:id",
  taskApi.permission("删除任务"),
  groupRequired,
  async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get("path.id");
    await TaskDto.deleteTask(id);
    ctx.success({
      code: 14,
    });
  }
);

module.exports = { taskApi, [disableLoading]: false };
