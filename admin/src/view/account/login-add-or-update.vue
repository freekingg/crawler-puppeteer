<template>
  <el-dialog v-model="visible" title="Tips" :close-on-click-modal="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" label-width="120px">
      <el-form-item prop="phone" label="电话号码">
        <el-input disabled v-model="dataForm.phone" placeholder="请输入手机号带 + " />
      </el-form-item>
      <el-form-item prop="loginType" label="登录">
        <el-radio-group v-model="dataForm.loginType">
          <el-radio :label="1">二维码</el-radio>
          <el-radio :label="2" disabled>验证码</el-radio>
        </el-radio-group>

        <p>请扫描以下二维码有登录</p>
        <el-button type="primary" @click="authLoginHandle" :disabled="qrLoading" :loading="qrLoading">加载二维码</el-button>
        <div>
          <el-image :src="loginQr" class="loginQr" style="width:300px;height:300px">
            <template #placeholder>
              <div class="image-slot">
                <i class="el-input__icon el-icon-loading"></i>
              </div>
            </template>
            <template #error>
              <div class="image-slot">
                <i class="el-input__icon el-icon-loading"></i>
              </div>
            </template>
          </el-image>
        </div>
      </el-form-item>
      <el-form-item prop="authData" label="验权信息">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="此处理不需要填写"
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
          const info = await accountModel.getAccount(data.dataForm.id)
          data.dataForm = info
          data.dataForm.loginType = 1
        }
      })
    }

    const resetForm = () => {
      dataFormRef.value.resetFields()
    }

    const authLoginHandle = async () => {
      data.qrLoading = true
      // 每5s获取一次二维码图片
      let timer2 = null
      setTimeout(() => {
        timer2 = setInterval(() => {
          getLoginQrHandle()
        }, 5000)
      }, 5000)

      try {
        const info = await accountModel.authLogin(data.dataForm)
        clearInterval(timer2)
        console.log('info: ', info)
        data.qrLoading = false
        data.dataForm.authData = info.authData
        ElMessage({
          message: '登录成功',
          type: 'success',
          duration: 500,
          onClose: () => {
            visible.value = false
            loginQr.value = ''
            context.emit('refreshDataList')
          },
        })

      } catch (error) {
        console.log(error)
        clearInterval(timer2)
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

    const getLoginQrHandle = () => {
      accountModel
        .getLoginQr(data.dataForm)
        .then(result => {
          if (result.path) {
            loginQr.value = result.path+ '?t='+ Math.random()
          }
        })
        .catch(err => {
          console.log(err)
        })
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
