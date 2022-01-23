import { LinRouter, NotFound, disableLoading } from "lin-mizar";
import { groupRequired } from "../../middleware/jwt";
import { TaskSearchValidator } from "../../validator/task";
import { PositiveIdValidator } from "../../validator/common";

import { CrawlerTaskLogDao } from "../../dao/crawler-task-log";

const taskTaskLogApi = new LinRouter({
  prefix: "/v1/crawler/task/log",
  module: "任务日志",
});

const TaskRunLogDto = new CrawlerTaskLogDao();

taskTaskLogApi.get("/:id", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const id = v.get("path.id");
  const item = await TaskRunLogDto.getItem(id);
  if (!item) {
    throw new NotFound({
      code: 10022,
    });
  }
  ctx.json(item);
});

taskTaskLogApi.get("/", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const items = await TaskRunLogDto.getItems(v);
  ctx.json(items);
});

taskTaskLogApi.linDelete(
  "deleteTaskLog",
  "/:id",
  taskTaskLogApi.permission("删除任务日志"),
  groupRequired,
  async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get("path.id");
    await TaskRunLogDto.deleteTask(id);
    ctx.success({
      code: 14,
    });
  }
);

module.exports = { taskTaskLogApi, [disableLoading]: false };
