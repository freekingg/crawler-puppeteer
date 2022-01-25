<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="13">
        <!-- <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.host" placeholder="请输入域名" clearable />
          </el-form-item>
        </el-form> -->
      </el-col>

      <el-col :span="8" class="btn-group">
        <el-button-group>
          <el-button icon="el-icon-search" @click="getDataList(dataForm)">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateHandle">添加任务</el-button>
        </el-button-group>
      </el-col>
    </el-row>

    <div class="wrap">
      <el-table size="mini" v-loading="dataListLoading" :data="dataList" border>
        <el-table-column prop="title" label="名称" />
        <el-table-column prop="url" label="网址" />
        <el-table-column prop="implement" label="实现类" />
        <el-table-column prop="account" label="账号" width="120" />
        <el-table-column prop="proxyIp" label="代理IP" width="120" />
        <el-table-column prop="time" label="定时执行" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <div
              v-if="scope.row.status == 2"
              style="display: flex;align-items:center;flex-direction: column;justify-content: center;"
            >
              <el-button type="primary" size="mini"> 进行中 <i class="el-icon-loading"></i> </el-button>
              <!-- <el-button size="mini" style="margin-left:0" @click="chatModal(scope.row.groups)" type="text">运行统计</el-button> -->
            </div>
            <el-tag size="medium" type="info" v-else>停止</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="备注" width="120" />
        <el-table-column prop="create_time" label="创建时间" width="160" />
        <el-table-column label="操作" fixed="right" header-align="center" align="center" width="180">
          <template #default="scope">
            <div class="btn-area">
              <el-button type="success" size="mini" @click="startHandle(scope.row.id, scope.row)">{{
                scope.row.status == 2 ? '停止' : '开始'
              }}</el-button>
              <el-button
                type="primary"
                size="mini"
                :disabled="scope.row.status == 2"
                @click="addOrUpdateHandle(scope.row.id)"
                >修改</el-button
              >
              <el-button
                type="danger"
                size="mini"
                :disabled="scope.row.status == 2"
                @click="deleteHandle(scope.row.id, scope.row)"
                >删除</el-button
              >
              <el-dropdown style="margin-left:8px" size="mini">
                <el-button type="primary" size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="budanHandle(scope.row.id, scope.row)">补单任务</el-dropdown-item>
                    <el-dropdown-item @click="loginHandle(scope.row.id, scope.row)">预登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList(dataForm)" />
    <add-or-update-budan
      v-if="budanAddOrUpdateVisible"
      ref="budanAddOrUpdate"
      @refreshDataList="getDataList(dataForm)"
    />
    <History v-if="historyVisible" :tableData="historyData" ref="historyAddOrUpdate" />
    <login-add-or-update
      v-if="loginAddOrUpdateVisible"
      ref="loginAddOrUpdate"
      @refreshDataList="getDataList(dataForm)"
    />
  </div>
</template>

<script>
import { reactive, toRefs, ref, nextTick } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import taskModel from '@/model/task'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './task-add-or-update.vue'
import AddOrUpdateBudan from './task-add-or-update-budan.vue'
import LoginAddOrUpdate from './login-add-or-update.vue'
import History from './history'

export default {
  components: {
    AddOrUpdate,
    AddOrUpdateBudan,
    LoginAddOrUpdate,
    History,
  },
  setup() {
    const addOrUpdate = ref(null)
    const loginAddOrUpdate = ref(null)
    const budanAddOrUpdate = ref(null)
    const mixinModuleOptions = {
      getDataListIsPage: true,
      addOrUpdate,
      getDataListModel: taskModel.getTasks,
      deleteDataModel: taskModel.deleteTask,
    }

    const {
      initMixinViewModuleOptions,
      getDataList,
      deleteHandle,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      dataList,
    } = mixinViewModule()

    const data = reactive({
      dataForm: {
        type: 1,
      },
      loginAddOrUpdateVisible: false,
      budanAddOrUpdateVisible: false,
      historyVisible: false,
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

    const startHandle = (id, row) => {
      const loading = ElLoading.service({
        lock: true,
        text: '启动中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      // 开始任务
      if (row.status == 1) {
        taskModel
          .starTirrigationTask(row)
          .then(result => {
            taskModel.editTask(id, { ...row, status: 2 }).then(result => {
              loading.close()
              ElMessage({
                message: '提交成功,请至任务日志查看结果',
                type: 'success',
                duration: 1000,
              })
              getDataList(data.dataForm)
            })
          })
          .catch(err => {
            loading.close()
          })
      }

      // 停止任务
      if (row.status == 2) {
        taskModel
          .stopTirrigationTask(row)
          .then(result => {
            taskModel.editTask(id, { ...row, status: 1 }).then(result => {
              loading.close()
              getDataList(data.dataForm)
            })
          })
          .catch(err => {
            loading.close()
          })
      }
    }

    const budanHandle = id => {
      data.budanAddOrUpdateVisible = true
      nextTick(() => {
        budanAddOrUpdate.value.dataForm.id = id
        budanAddOrUpdate.value.init()
      })
    }

    const loginHandle = id => {
      data.loginAddOrUpdateVisible = true
      nextTick(() => {
        loginAddOrUpdate.value.dataForm.id = id
        loginAddOrUpdate.value.init()
      })
    }

    return {
      ...toRefs(data),
      getDataList,
      addOrUpdate,
      budanAddOrUpdate,
      loginAddOrUpdate,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      deleteHandle,
      dataList,
      loginHandle,
      budanHandle,
      startHandle,
    }
  },
}
</script>

<style lang="scss" scoped>
.container {
  .title {
    height: 59px;
    line-height: 59px;
    color: $parent-title-color;
    font-size: 16px;
    font-weight: 500;
    text-indent: 40px;
    border-bottom: 1px solid #dae1ec;

    .back {
      float: right;
      margin-right: 40px;
      cursor: pointer;
    }
  }

  .wrap {
    padding: 20px;
  }

  .submit {
    float: left;
  }

  .account-box {
    display: flex;
    flex-wrap: wrap;
    max-height: 80px;
    overflow: auto;
  }
}
.btn-area button {
  margin-bottom: 4px;
}
</style>
