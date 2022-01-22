const demoRouter = {
  route: null,
  name: null,
  title: 'demo页面',
  type: 'folder', // 类型: folder, tab, view
  icon: 'iconfont icon-tushuguanli',
  filePath: 'view/demo/', // 文件路径
  order: null,
  inNav: true,
  children: [
    {
      title: '列表',
      type: 'view',
      name: 'Demo',
      route: '/demo/demo',
      filePath: 'view/demo/demo.vue',
      inNav: true,
      icon: 'iconfont icon-tushuguanli',
    },
  ],
}

export default demoRouter
