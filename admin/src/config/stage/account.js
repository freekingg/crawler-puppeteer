const demoRouter = {
  route: null,
  name: null,
  title: '帐号管理',
  type: 'folder', // 类型: folder, tab, view
  icon: 'iconfont icon-tushuguanli',
  filePath: 'view/account/', // 文件路径
  order: null,
  inNav: true,
  children: [
    {
      title: '列表',
      type: 'view',
      name: 'Demo',
      route: '/account/account',
      filePath: 'view/account/account.vue',
      inNav: true,
      icon: 'iconfont icon-tushuguanli',
    },
  ],
}

export default demoRouter
