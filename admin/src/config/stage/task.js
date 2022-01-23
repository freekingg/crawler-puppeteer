const demoRouter = {
  route: null,
  name: null,
  title: '爬虫管理',
  type: 'folder', // 类型: folder, tab, view
  icon: 'iconfont icon-naozhongxiaoxitixing',
  filePath: 'view/task/', // 文件路径
  order: null,
  inNav: true,
  children: [
    {
      title: '任务列表',
      type: 'view',
      name: 'tasklist',
      route: '/task/task',
      filePath: 'view/task/task.vue',
      inNav: true,
      icon: 'iconfont icon-naozhongxiaoxitixing',
    },
    {
      title: '任务日志',
      type: 'view',
      name: 'tasklogtask',
      route: '/task/log/task',
      filePath: 'view/task/log-task.vue',
      inNav: true,
      icon: 'iconfont icon-rizhiguanli',
    },
    {
      title: '运行日志',
      type: 'view',
      name: 'tasklogrun',
      route: '/task/log/run',
      filePath: 'view/task/log-run.vue',
      inNav: true,
      icon: 'iconfont icon-rizhiguanli',
    },
    {
      title: '数据列表',
      type: 'view',
      name: 'tasklogrun',
      route: '/task/log/run',
      filePath: 'view/task/log-run.vue',
      inNav: true,
      icon: 'iconfont icon-rizhiguanli',
    },
  ],
}

export default demoRouter
