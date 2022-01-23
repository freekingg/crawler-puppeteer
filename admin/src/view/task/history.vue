<template>
  <el-dialog v-model="visible" title="会话列表" :close-on-click-modal="false">
      <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="title" label="名称"/>
      <el-table-column prop="chatId" label="id"/>
    </el-table>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'

export default {
  emits: ['refreshDataList'],
  props: {
    tableData: Array,
    default:()=>[]
  },
  setup(props, context) {
    const dataFormRef = ref(null)
    const visible = ref(false)

    const data = reactive({
      dataForm: {
        id: '',
        phone: '',
        authData:'',
        loginType: 1,
      },
      dataRule: {
        phone: [{ required: true, message: '请输入号码', trigger: 'blur' }],
      },
      loading: false,
      qrLoading: false,
      tableData:props.tableData
    })

    const init = () => {
      visible.value = true
    }

    return {
      ...toRefs(data),
      dataFormRef,
      init,
      visible,
    }
  },
}
</script>
<style scoped>
.loginQr{
  border: 1px dotted #666;
  margin-top: 4px;
  border-radius: 6px;
}
.image-slot {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
