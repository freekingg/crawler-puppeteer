<template>
  <el-dialog v-model="visible" title="Tips">
    <el-form
      :model="dataForm"
      ref="dataFormRef"
      label-width="120px"
    >
      <el-form-item label="任务名称">
        <el-input v-model="dataForm.crawler_task.title" readonly  />
      </el-form-item>
      <el-form-item label="信息">
        <el-input
          size="medium"
          readonly
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          v-model="dataForm.message"
        ></el-input>
      </el-form-item>
      <el-form-item label="错误信息">
        <el-input
          readonly
          size="medium"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          v-model="dataForm.errorStack"
        ></el-input>
      </el-form-item>
      <el-form-item label="时间">
        <el-input v-model="dataForm.create_time" readonly  />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'
import logModel from '@/model/log-run'

export default {
  emits: ['refreshDataList'],

  setup(props, context) {
    const dataFormRef = ref(null)
    const contentDataFormRef = ref(null)

    const visible = ref(false)

    const data = reactive({
      dataForm: {
        id: '',
        phone: '',
        crawler_task: {},
      },
      loading: false,
    })

    const init = () => {
      visible.value = true
      nextTick(async () => {
        console.log(data.dataForm)
        if (data.dataForm.id) {
          const info = await logModel.getLog(data.dataForm.id)
          data.dataForm = info
        }
      })
    }

    return {
      ...toRefs(data),
      dataFormRef,
      contentDataFormRef,
      init,
      visible,
    }
  },
}
</script>
<style scoped>
.el-form--inline{
  display: flex;
}
</style>
