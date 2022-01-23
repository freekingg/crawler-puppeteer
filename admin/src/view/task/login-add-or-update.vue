<template>
  <el-dialog v-model="visible" title="Tips" :close-on-click-modal="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" label-width="120px">
      <el-form-item prop="phone" label="账号">
        <el-input disabled v-model="dataForm.account"  />
      </el-form-item>
      <el-form-item prop="loginType" label="登录">
        <el-button type="primary" @click="authLoginHandle" :disabled="qrLoading" :loading="qrLoading">{{qrLoading ? '登录中...' : '点击登录'}}</el-button>
      </el-form-item>
      <el-form-item prop="authData" label="验权信息">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="此处不需要填写,登录成功后,会自动填充"
          v-model="dataForm.authData"
        ></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import accountModel from '@/model/account'
import taskModel from '@/model/task'

export default {
  emits: ['refreshDataList'],

  setup(props, context) {
    const dataFormRef = ref(null)
    const visible = ref(false)
    const loginQr = ref(null)

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

    const authLoginHandle = async () => {
      data.qrLoading = true
      try {
        const info = await taskModel.authLogin(data.dataForm)
        console.log('info: ', info)
        data.qrLoading = false
        data.dataForm.authData = info.authData
        ElMessage({
          message: '登录成功',
          type: 'success',
          duration: 500,
          onClose: () => {
            visible.value = false
            context.emit('refreshDataList')
          },
        })

      } catch (error) {
        console.log(error)
        data.qrLoading = false
        ElMessage({
          message: '出错了，请重试',
          type: 'error',
          duration: 500,
          onClose: () => {
            visible.value = false
            loginQr.value = ''
            context.emit('refreshDataList')
          },
        })
      }
    }

    // 表单提交
    const dataFormSubmitHandle = async () => {
      dataFormRef.value.validate(async valid => {
        if (!valid) {
          // this.$message.error('请将信息填写完整')
          return false
        }

        if (!data.dataForm.id) {
          try {
            data.loading = true
            await accountModel.createAccount(data.dataForm)
            ElMessage({
              message: '添加成功',
              type: 'success',
              duration: 500,
              onClose: () => {
                visible.value = false
                context.emit('refreshDataList')
              },
            })
          } catch (e) {
            data.loading = false
            console.log(e)
          }
        } else {
          try {
            data.loading = true
            await accountModel.editAccount(data.dataForm.id, data.dataForm)
            ElMessage({
              message: '修改成功',
              type: 'success',
              duration: 500,
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

    return {
      ...toRefs(data),
      dataFormRef,
      init,
      resetForm,
      dataFormSubmitHandle,
      authLoginHandle,
      visible,
      loginQr,
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
