const demoRouter = {
  route: null,
  name: null,
  title: '任务管理',
  type: 'folder', // 类型: folder, tab, view
  icon: 'iconfont icon-naozhongxiaoxitixing',
  filePath: 'view/task/', // 文件路径
  order: null,
  inNav: true,
  children: [
    {
      title: '灌水模式',
      type: 'view',
      name: 'Demo',
      route: '/task/irrigation',
      filePath: 'view/task/irrigation.vue',
      inNav: true,
      icon: 'iconfont icon-naozhongxiaoxitixing',
    },
    {
      title: '冒泡模式',
      type: 'view',
      name: 'Demo',
      route: '/task/bubble',
      filePath: 'view/task/bubble.vue',
      inNav: true,
      icon: 'iconfont icon-naozhongxiaoxitixing',
    },
  ],
}

export default demoRouter
