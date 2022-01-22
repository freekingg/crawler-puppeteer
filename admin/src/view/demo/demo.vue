<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="15">
        <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.host" placeholder="请输入域名" clearable />
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
        <el-table-column prop="title" label="标题" header-align="center" align="center" />
        <el-table-column prop="keywords" label="关键字" header-align="center" align="center" />
        <el-table-column prop="template" label="模板" header-align="center" align="center" />
        <el-table-column prop="path" label="缓存模板" header-align="center" align="center" />
        <el-table-column prop="category.title" label="分组" header-align="center" align="center" />
        <el-table-column prop="update_time" label="创建时间" header-align="center" align="center" />
        <el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
          <template #default="scope">
            <el-button type="success" size="mini" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
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
import { reactive, toRefs, ref } from 'vue'

import bookModel from '@/model/book'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './demo-add-or-update.vue'

export default {
  components: {
    AddOrUpdate,
  },
  setup() {
    const addOrUpdate = ref(null)
    const mixinModuleOptions = {
      getDataListIsPage: true,
      addOrUpdate,
      getDataListModel: bookModel.getBooks,
      deleteDataModel: bookModel.deleteBook,
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
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

    return {
      ...toRefs(data),
      getDataList,
      addOrUpdate,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      deleteHandle,
      dataList,
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
</style>
