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
      <!-- <el-form-item prop="contentData" label="发送内容">
        <el-input
          size="medium"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="请输入发送内容"
          v-model="dataForm.contentData"
        ></el-input>
      </el-form-item> -->
      <el-form-item prop="time" label="发送内容">
        <div class="box">
          <el-form :inline="true" :rules="contentDataRule" ref="contentDataFormRef" :model="contentDataForm">
            <el-form-item prop="content">
              <el-input
                size="medium"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="请输入发送内容"
                v-model="contentDataForm.content"
              ></el-input>
            </el-form-item>
            <el-form-item prop="time">
              <el-date-picker
                v-model="contentDataForm.time"
                type="datetime"
                placeholder="Select date and time"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="contentDataFormSubmitHandle">添加</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="content" label="内容"/>
          <el-table-column label="帐号" width="80">
          <template #default="scope">
              <el-button size="mini" @click="delTableDataHandle(scope.$index)" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        </div>
      </el-form-item>
      <el-form-item prop="accounts" label="发送帐号">
        <el-select v-model="dataForm.accounts" multiple placeholder="Select">
        <el-option
          v-for="item in accounts"
          :key="item.id"
          :label="item.phone"
          :value="item.id"
        >
        </el-option>
      </el-select>
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
import dayjs from 'dayjs'

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
        type: 2,
        summary: '',
      },
      contentDataForm: {
        time: '',
        content: '',
      },
      dataRule: {
        title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        contentData: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        accounts: [{ required: true, message: '请选择内容', trigger: 'change' }],
      },
      contentDataRule: {
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        time: [{ required: true, message: '请输入间隔时间', trigger: 'blur' }],
      },
      loading: false,
      accounts:[],
      tableData: [],
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
          data.tableData = JSON.parse(info.contentData)
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
       data.dataForm.contentData = JSON.stringify(data.tableData)
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

    // 表单提交
    const contentDataFormSubmitHandle = async () => {
      contentDataFormRef.value.validate(async valid => {
        if (!valid) {
          // this.$message.error('请将信息填写完整')
          return false
        }
        let contentDataForm = data.contentDataForm
        contentDataForm.time = dayjs(contentDataForm.time).format('YYYY-MM-DD HH:mm:ss')
        data.tableData.push(JSON.parse(JSON.stringify(contentDataForm)))
        contentDataFormRef.value.resetFields()

      })
    }

    const delTableDataHandle = (index) => {
      data.tableData.splice(index,1)
    }


    return {
      ...toRefs(data),
      dataFormRef,
      contentDataFormRef,
      init,
      resetForm,
      dataFormSubmitHandle,
      contentDataFormSubmitHandle,
      visible,
      delTableDataHandle
    }
  },
}
</script>
<style scoped>
.el-form--inline{
  display: flex;
}
</style>
