import { LinRouter, NotFound, disableLoading } from "lin-mizar";
import { groupRequired } from "../../middleware/jwt";
import { TaskSearchValidator } from "../../validator/task";
import { PositiveIdValidator } from "../../validator/common";

import { CrawlerRunLogDao } from "../../dao/crawler-run-log";

const taskRunLogApi = new LinRouter({
  prefix: "/v1/crawler/run/log",
  module: "运行日志",
});

const TaskRunLogDto = new CrawlerRunLogDao();

taskRunLogApi.get("/:id", async (ctx) => {
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

taskRunLogApi.get("/", async (ctx) => {
  const v = await new TaskSearchValidator().validate(ctx);
  const items = await TaskRunLogDto.getItems(v);
  ctx.json(items);
});

taskRunLogApi.linDelete(
  "deleteTaskLog",
  "/:id",
  taskRunLogApi.permission("删除运行日志"),
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

module.exports = { taskRunLogApi, [disableLoading]: false };
