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
      <el-form-item label="请求参数">
        <el-input
          readonly
          size="medium"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          v-model="dataForm.params"
        ></el-input>
      </el-form-item>
      <el-form-item label="时间">
        <el-input v-model="dataForm.create_time" readonly  />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle">重新执行此轮任务</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import logModel from '@/model/log-task'
import taskModel from '@/model/task'

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

    const dataFormSubmitHandle = () => {
      visible.value = true
      nextTick(async () => {
        taskModel.reStarTirrigationTask(data.dataForm).then((result) => {
          ElMessage({
              message: '请求成功,请稍后查看执行结果',
              type: 'success',
              duration: 500,
              onClose: () => {
                visible.value = false
                context.emit('refreshDataList')
              },
            })
        })
        
      })
    }

    

    return {
      ...toRefs(data),
      dataFormRef,
      contentDataFormRef,
      init,
      visible,
      dataFormSubmitHandle
    }
  },
}
</script>
<style scoped>
.el-form--inline{
  display: flex;
}
</style>
