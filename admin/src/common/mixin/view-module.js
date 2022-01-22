import { reactive, toRefs, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

export default function () {
  const data = reactive({
    // 设置属性
    mixinViewModuleOptions: {
      createdIsNeed: true, // 此页面是否在 进入 时，调用查询数据列表接口？
      getDataListModel: '', // 获取数据方法
      deleteDataModel: '', // 删除数据方法
      getDataListIsPage: false, // 数据列表接口，是否需要分页？
      deleteIsBatch: false, // 删除接口，是否需要批量？
      deleteIsBatchKey: 'id', // 删除接口，批量状态下由那个key进行标记操作？比如：pid，uid...
      exportURL: '', // 导出接口，API地址
      addOrUpdate: '', // 修改组件元素
    },
    // 默认属性
    dataForm: {}, // 查询条件
    dataList: [], // 数据列表
    sums: {}, // 汇总数据
    order: '', // 排序，asc／desc
    orderField: '', // 排序，字段
    page: 1, // 当前页码
    limit: 10, // 每页数
    total: 0, // 总条数
    dataListLoading: false, // 数据列表，loading状态
    dataListSelections: [], // 数据列表，多选项
    addOrUpdateVisible: false, // 新增／更新，弹窗visible状态
  })

  // 初始化赋值
  const initMixinViewModuleOptions = async (options, dataForm = {}) => {
    data.mixinViewModuleOptions = {
      ...data.mixinViewModuleOptions,
      ...options,
    }
    data.dataForm = {
      ...data.dataForm,
      ...dataForm,
    }
    if (data.mixinViewModuleOptions.createdIsNeed) {
      getDataList()
    }
  }

  // 获取列表数据
  const getDataList = async info => {
    data.dataListLoading = true
    try {
      const res = await data.mixinViewModuleOptions.getDataListModel({
        order: data.order,
        orderField: data.orderField,
        page: data.page - 1,
        count: data.limit,
        ...data.dataForm,
        ...info,
      })
      data.dataList = res.list ? res.list : res
      data.total = res.total
      data.sums = data.mixinViewModuleOptions.hasSums ? res.sum : {}
      // 同步请求参数page到分页组件page
      data.dataForm.page ? (data.page = data.dataForm.page) : ''
      data.renderTable = false
      setTimeout(() => {
        data.renderTable = true
      }, 500)
    } catch (error) {
      console.log(error)
      data.dataList = []
      data.total = 1
    } finally {
      data.dataListLoading = false
    }
  }

  // 分页, 每页条数
  const pageSizeChangeHandle = async info => {
    data.page = 1
    data.limit = info
    getDataList()
  }

  // 分页, 当前页
  const pageCurrentChangeHandle = async info => {
    data.page = info
    getDataList()
  }

  // 新增 / 修改
  const addOrUpdateHandle = async (id = '') => {
    const filterId = typeof id === 'object' ? '' : id
    data.addOrUpdateVisible = true
    nextTick(() => {
      data.mixinViewModuleOptions.addOrUpdate.dataForm.id = filterId
      data.mixinViewModuleOptions.addOrUpdate.init()
    })
  }

  // 删除
  const deleteHandle = async id => {
    ElMessageBox.confirm('请确认是否删除此数据?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      await data.mixinViewModuleOptions.deleteDataModel(id)
      ElMessage({
        message: '数据已删除',
        type: 'success',
        duration: 500,
        onClose: () => {
          getDataList()
        },
      })
    })
  }

  // 多选
  const dataListSelectionChangeHandle = async info => {
    data.dataListSelections = info
  }

  // 排序
  const dataListSortChangeHandle = async info => {
    if (!info.order || !info.prop) {
      this.order = ''
      this.orderField = ''
      return false
    }
    data.order = info.order.replace(/ending$/, '')
    data.orderField = info.prop.replace(/([A-Z])/g, '_$1').toLowerCase()
    getDataList()
  }

  return {
    ...toRefs(data),
    initMixinViewModuleOptions,
    getDataList,
    dataListSelectionChangeHandle,
    dataListSortChangeHandle,
    pageSizeChangeHandle,
    pageCurrentChangeHandle,
    addOrUpdateHandle,
    deleteHandle,
  }
}
