<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="15">
        <!-- <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.host" placeholder="请输入域名" clearable />
          </el-form-item>
        </el-form> -->
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
        <el-table-column prop="title" label="名称"  />
        <el-table-column label="内容" width="120">
          <template #default="scope">
            详情中查看
          </template>
        </el-table-column>
         <el-table-column prop="time" label="间隔时间(秒)"  width="120"/>
        <el-table-column label="帐号" width="300">
          <template #default="scope">
            <div class="account-box">
              <el-tag size="medium" style="margin-right:2px;margin-bottom:2px"  type="info" v-for="(item,index) in scope.row.accounts" :key="index">{{item.phone}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag size="medium" v-if="scope.row.status == 2">进行中</el-tag>
            <el-tag size="medium"  type="info" v-else>停止</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="150"/>
        <el-table-column label="操作" fixed="right" header-align="center" align="center" width="260">
          <template #default="scope">
            <el-button type="success" size="mini" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
            <el-button type="primary" size="mini" @click="loginHandle(scope.row.id, scope.row)">{{scope.row.status == 2 ?'停止':'开始'}}</el-button>
            <el-button type="danger" size="mini" @click="deleteHandle(scope.row.id, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList(dataForm)" />
  </div>
</template>

<script>
import { reactive, toRefs, ref, nextTick } from 'vue'

import taskModel from '@/model/task'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './bubble-add-or-update.vue'

export default {
  components: {
    AddOrUpdate,
  },
  setup() {
    const addOrUpdate = ref(null)
    const loginAddOrUpdate = ref(null)
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
        type:2
      },
      loginAddOrUpdateVisible:false
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

    const loginHandle = (id) => {
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
      loginAddOrUpdate,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      deleteHandle,
      dataList,
      loginHandle
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

  .account-box{
    display: flex;
    flex-wrap: wrap;
    max-height: 80px;
    overflow: auto;
  }
}
</style>
