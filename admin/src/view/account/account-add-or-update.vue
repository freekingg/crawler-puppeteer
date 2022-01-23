<template>
  <el-dialog v-model="visible" title="Tips">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataFormRef"
      @keyup.enter="dataFormSubmitHandle"
      label-width="120px"
    >
      <el-form-item prop="phone" label="账号">
        <el-input v-model="dataForm.phone" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item prop="pwd" label="密码">
        <el-input v-model="dataForm.pwd" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item prop="url" label="网址">
        <el-input v-model="dataForm.url" placeholder="请输入登录网址" />
      </el-form-item>
      <el-form-item prop="implement" label="实现类">
        <el-input v-model="dataForm.implement" placeholder="对应后端服务的业务实现方法" />
      </el-form-item>
      <el-form-item prop="implementBefore" label="前置实现类">
        <el-input v-model="dataForm.implementBefore" placeholder="实现类前开始的方法，如登录或者预处理方法" />
      </el-form-item>
      <el-form-item prop="summary" label="简介">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入代理"
          v-model="dataForm.summary"
        ></el-input>
      </el-form-item>
      <el-form-item prop="extra" label="扩展信息">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入扩展信息"
          v-model="dataForm.extra"
        ></el-input>
      </el-form-item>
      <el-form-item prop="authData" label="验权信息">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          v-model="dataForm.authData"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle">确认</el-button>
    </template>
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

    const data = reactive({
      dataForm: {
        id: '',
        phone: '',
        summary: '',
        url: '',
        extra: '',
        implementBefore:'',
      },
      dataRule: {
        phone: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        implement: [{ required: true, message: '请输入实现方法', trigger: 'blur' }],
      },
      loading: false,
    })

    const init = () => {
      visible.value = true
      nextTick(async () => {
        dataFormRef.value.resetFields()
        console.log('dataForm', data.dataForm)
        if (data.dataForm.id) {
          const info = await accountModel.getAccount(data.dataForm.id)
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
      visible,
    }
  },
}
</script>
