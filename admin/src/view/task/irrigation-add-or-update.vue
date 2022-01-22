<template>
  <el-dialog v-model="visible" title="Tips">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataFormRef"
      @keyup.enter="dataFormSubmitHandle"
      label-width="120px"
    >
      <el-form-item prop="title" label="任务名称">
        <el-input v-model="dataForm.title" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item prop="contentData" label="发送内容">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="请输入发送内容"
          v-model="dataForm.contentData"
        ></el-input>
      </el-form-item>
      <el-form-item prop="time" label="间隔时间(秒)">
        <el-input v-model="dataForm.time" type="number" placeholder="请输入间隔时间，单位(秒)" />
      </el-form-item>
      <el-form-item prop="accounts" label="帐号">
        <el-select v-model="dataForm.accounts" @change="accountChangeHandle" placeholder="Select">
        <el-option
          v-for="item in accounts"
          :key="item.id"
          :label="item.phone"
          :value="item.id"
        >
        </el-option>
      </el-select>
      </el-form-item>
      <el-form-item prop="proxyType" label="代理">
        <el-radio-group v-model="dataForm.proxyType">
          <el-radio :label="1">http代理</el-radio>
          <el-radio :label="2">socks5代理</el-radio>
        </el-radio-group>
        <div>
          <el-input v-model="dataForm.pwd" placeholder="请输入代理" />
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
      <el-button type="primary" @click="dataFormSubmitHandle">确认</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import taskModel from '@/model/task'
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
        type: 1,
        summary: '',
        proxyType:1,
      },
      dataRule: {
        title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        contentData: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        accounts: [{ required: true, message: '请选择内容', trigger: 'blur' }],
        time: [{ required: true, message: '请输入间隔时间', trigger: 'blur' }],
      },
      loading: false,
      accounts:[]
    })

    const init = () => {
      visible.value = true
      nextTick(async () => {
        dataFormRef.value.resetFields()
        let accounts = await accountModel.getAccounts()
        data.accounts = accounts.filter(item=>item.authData)
        if (data.dataForm.id) {
          const info = await taskModel.getTask(data.dataForm.id)
          data.dataForm = info
          data.dataForm.accounts = info.accounts.map(item=>item.id)
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

        let accounts = data.dataForm.accounts
        let newAccounts = accounts.map(it1=>{
          return data.accounts.find(it2=>it1 == it2.id)
        })
       data.dataForm.accounts = newAccounts
        if (!data.dataForm.id) {
          try {
            data.loading = true
            await taskModel.createTask(data.dataForm)
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
            await taskModel.editTask(data.dataForm.id, data.dataForm)
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

    const accountChangeHandle = (val) => {
      console.log(val);
    }


    return {
      ...toRefs(data),
      dataFormRef,
      init,
      resetForm,
      dataFormSubmitHandle,
      visible,
      accountChangeHandle
    }
  },
}
</script>
