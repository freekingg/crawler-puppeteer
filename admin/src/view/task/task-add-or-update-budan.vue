<template>
  <el-dialog v-model="visible" title="添加">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataFormRef"
      @keyup.enter="dataFormSubmitHandle"
      label-width="120px"
    >
      <el-form-item prop="extra" label="补单参数">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6 }"
          placeholder='请输入参数-格式： {"startTime":"2022-01-25 19:31:34","endTime":"2022-01-25 19:32:34"}'
          v-model="dataForm.extra"
        ></el-input>
      </el-form-item>
      <el-form-item prop="title" label="任务名称">
        <el-input v-model="dataForm.title" disabled placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item prop="url" label="网址">
        <el-input v-model="dataForm.url" disabled placeholder="请输入网址" />
      </el-form-item>
      <el-form-item prop="implement" label="实现类">
        <el-input v-model="dataForm.implement" disabled placeholder="对应后端服务的业务实现方法" />
      </el-form-item>
      <el-form-item prop="proxyType" label="代理">
        <el-radio-group v-model="dataForm.proxyType" disabled>
          <el-radio :label="1">http代理</el-radio>
          <el-radio :label="2">socks5代理</el-radio>
          <el-radio :label="3">其它</el-radio>
          <el-radio :label="4">不使用</el-radio>
        </el-radio-group>
        <div v-if="dataForm.proxyType != 4">
          <el-input v-model="dataForm.proxyIp" placeholder="请输入代理">
            <template #suffix>
              <el-popover title="提示" :width="200" trigger="hover">
                <div>
                  <p>
                    代理服务的IP，如留空则不使用代理，多个代理使用 | 隔开
                  </p>
                </div>
                <template #reference>
                  <el-icon class="el-input__icon">
                    <i class="el-icon-info"></i>
                  </el-icon>
                </template>
              </el-popover>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item prop="summary" label="简介">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入简介"
          v-model="dataForm.summary"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle">提交</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import taskModel from '@/model/task'

export default {
  emits: ['refreshDataList'],

  setup(props, context) {
    const dataFormRef = ref(null)
    const visible = ref(false)

    const data = reactive({
      dataForm: {
        id: '',
        phone: '',
        type: 1,
        summary: '',
        proxyType: 4,
      },
      dataRule: {
        title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        contentData: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        implement: [{ required: true, message: '请输入实现方法', trigger: 'blur' }],
        url: [{ required: true, message: '请输入网址', trigger: 'blur' }],
      },
      loading: false,
    })

    const init = () => {
      visible.value = true
      nextTick(async () => {
        dataFormRef.value.resetFields()
        if (data.dataForm.id) {
          const info = await taskModel.getTask(data.dataForm.id)
          data.dataForm = info
        }
      })
    }
    const resetForm = () => {
      dataFormRef.value.resetFields()
    }
    // 表单提交
    const dataFormSubmitHandle = async () => {
      dataFormRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        if (data.dataForm.id) {
          let params = JSON.parse(data.dataForm.extra)
          if (!params || !params.startTime || !params.endTime) {
            ElMessage({
              message: '补单参数有误',
              type: 'error',
              duration: 1000,
            })
           return
          }
         
          try {
            data.loading = true
            await taskModel.patchStarTirrigationTask(data.dataForm)
            ElMessage({
              message: '提交成功,请至任务日志查看结果',
              type: 'success',
              duration: 1000,
              onClose: () => {
                visible.value = false
                context.emit('refreshDataList')
              },
            })
          } catch (e) {
            data.loading = false
            console.log(e)
          }
        }
      })
    }

    const accountChangeHandle = val => {
      console.log(val)
    }

    return {
      ...toRefs(data),
      dataFormRef,
      init,
      resetForm,
      dataFormSubmitHandle,
      visible,
      accountChangeHandle,
    }
  },
}
</script>
