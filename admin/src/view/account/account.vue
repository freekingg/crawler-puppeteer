<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="15">
        <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.host" placeholder="请输入账号" clearable />
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="6" class="btn-group">
        <el-button-group>
          <el-button icon="el-icon-search" @click="getDataList(dataForm)">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateHandle">添加</el-button>
        </el-button-group>
      </el-col>
    </el-row>

    <div class="wrap">
      <el-table size="mini" v-loading="dataListLoading" :data="dataList" border>
        <el-table-column prop="phone" label="账号" />
        <el-table-column prop="implement" label="实现类" />
        <el-table-column prop="summary" label="备注" />
        <el-table-column label="状态" width="120" header-align="center" align="center">
          <template #default="scope">
            <div class="status-box">
              <div style="text-align: center;">
                <el-tag size="medium" v-if="scope.row.authData">已登录</el-tag>
                <el-tag size="medium" type="info" v-else>未登录</el-tag>
              </div>
              <!-- <el-button v-if="scope.row.authData" @click="chatModal(scope.row.groups)" type="text">会话列表</el-button> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" />
        <el-table-column label="操作" fixed="right" header-align="center" align="center" width="280">
          <template #default="scope">
            <el-button type="success" size="mini" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
            <el-button type="danger" size="mini" @click="deleteHandle(scope.row.id, scope.row)">删除</el-button>
            <el-dropdown style="margin-left:8px">
              <el-button type="primary"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="loginHandle(scope.row.id, scope.row)">登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- <el-button type="primary" size="mini" @click="loginHandle(scope.row.id, scope.row)">登录</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList(dataForm)" />
    <login-add-or-update
      v-if="loginAddOrUpdateVisible"
      ref="loginAddOrUpdate"
      @refreshDataList="getDataList(dataForm)"
    />
    <History v-if="historyVisible" :tableData="historyData" ref="historyAddOrUpdate" />
  </div>
</template>

<script>
import { reactive, toRefs, ref, nextTick } from 'vue'

import accountModel from '@/model/account'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './account-add-or-update.vue'
import LoginAddOrUpdate from './login-add-or-update.vue'
import History from './history'

export default {
  components: {
    AddOrUpdate,
    History,
    LoginAddOrUpdate,
  },
  setup() {
    const addOrUpdate = ref(null)
    const loginAddOrUpdate = ref(null)
    const historyAddOrUpdate = ref(null)
    const mixinModuleOptions = {
      getDataListIsPage: true,
      addOrUpdate,
      getDataListModel: accountModel.getAccounts,
      deleteDataModel: accountModel.deleteAccount,
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
      dataForm: {},
      loginAddOrUpdateVisible: false,
      historyVisible: false,
      historyData: [],
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

    const loginHandle = id => {
      data.loginAddOrUpdateVisible = true
      nextTick(() => {
        loginAddOrUpdate.value.dataForm.id = id
        loginAddOrUpdate.value.init()
      })
    }

    const chatModal = groups => {
      data.historyVisible = true
      data.historyData = groups
      nextTick(() => {
        historyAddOrUpdate.value.init()
      })
    }

    return {
      ...toRefs(data),
      getDataList,
      addOrUpdate,
      loginAddOrUpdate,
      historyAddOrUpdate,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      deleteHandle,
      dataList,
      loginHandle,
      chatModal,
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
}
.status-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}
</style>
