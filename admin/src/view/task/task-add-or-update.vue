<template>
  <el-dialog v-model="visible" title="添加">
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

      <el-form-item prop="url" label="网址">
        <el-input v-model="dataForm.url" placeholder="请输入网址" />
      </el-form-item>
      <el-form-item prop="implement" label="实现类">
        <el-input v-model="dataForm.implement" placeholder="对应后端服务的业务实现方法" />
      </el-form-item>
      <!-- <el-form-item label="预实现类" prop="implementPre">
        <el-input v-model="dataForm.implementPre" placeholder="请输入预实现类">
          <template #suffix>
            <el-popover title="提示" :width="200" trigger="hover">
              <div>
                <p>
                  实现类之前的执行方法，如登录等预处理的方法
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
      </el-form-item> -->
      
      <el-form-item label="定时执行" prop="time">
        <el-input v-model="dataForm.time" placeholder="请输入时间表达式：如 30 * * * * * ,留空则只执行一次">
          <template #suffix>
            <el-popover title="提示" :width="500" trigger="hover">
              <div>
                <p>
                  <a href="https://github.com/node-schedule/node-schedule" target="_blank" style="color:blue"
                    >查看说明</a
                  >
                </p>
                <p>
                  如每分钟的第30秒定时执行一次: <br />
                  30 * * * * *
                </p>
                <br />
                <pre>
                    *    *    *    *    *    *
                    ┬    ┬    ┬    ┬    ┬    ┬
                    │    │    │    │    │    │
                    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
                    │    │    │    │    └───── month (1 - 12)
                    │    │    │    └────────── day of month (1 - 31)
                    │    │    └─────────────── hour (0 - 23)
                    │    └──────────────────── minute (0 - 59)
                    └───────────────────────── second (0 - 59, OPTIONAL)
                </pre>
              </div>
              <template #reference>
                <el-icon class="el-input__icon">
                  <i class="el-icon-info"></i>
                </el-icon>
              </template>
            </el-popover>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="proxyType" label="代理">
        <el-radio-group v-model="dataForm.proxyType">
          <el-radio :label="1">http代理</el-radio>
          <el-radio :label="2">socks5代理</el-radio>
        </el-radio-group>
        <div>
          <el-input v-model="dataForm.proxyIp" placeholder="请输入代理">
            <template #suffix>
              <el-popover title="提示" :width="200" trigger="hover">
                <div>
                  <p>
                    代理服务的IP，如留空则不使用代理
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
      <el-form-item label="账号" prop="account">
        <el-input v-model="dataForm.account" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input v-model="dataForm.pwd" placeholder="请输入密码" />
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
        proxyType: '',
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
          // this.$message.error('请将信息填写完整')
          return false
        }
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
