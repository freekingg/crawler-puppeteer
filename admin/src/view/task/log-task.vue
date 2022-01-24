<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="15">
        <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-select v-model="dataForm.task_id" class="m-2" placeholder="任务名称" clearable>
              <el-option
                v-for="item in tasks"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              >
              </el-option>
           </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="dataForm.status" class="m-2" placeholder="运行状态" clearable>
              <el-option
                v-for="item in status"
                :key="item.status"
                :label="item.title"
                :value="item.status"
              >
              </el-option>
           </el-select>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="6" class="btn-group">
        <el-button-group>
          <el-button icon="el-icon-search" @click="getDataList(dataForm)">查询</el-button>
        </el-button-group>
      </el-col>
    </el-row>

    <div class="wrap">
      <el-table size="mini" v-loading="dataListLoading" :data="dataList" border>
        <el-table-column prop="crawler_task.title" label="名称" width="160"/>
        <el-table-column prop="task_index" label="轮次" width="70"/>
        <el-table-column label="参数">
          <template #default="scope">
            <div>
              {{scope.row.params}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结果">
          <template #default="scope">
            <div>
              {{scope.row.result}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 0" size="small" type="success" >成功</el-tag>
            <el-tag size="small" type="info" v-else  @click="addOrUpdateHandle(scope.row.id)">异常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160" />
      </el-table>
    </div>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList(dataForm)" />
  </div>
</template>

<script>
import { reactive, toRefs, ref, nextTick } from 'vue'
import taskLogModel from '@/model/log-task'
import taskModel from '@/model/task'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './log-task-add-or-update.vue'

export default {
  components: {
    AddOrUpdate,
    History,
  },
  setup() {
    const addOrUpdate = ref(null)
    const loginAddOrUpdate = ref(null)
    const mixinModuleOptions = {
      getDataListIsPage: true,
      addOrUpdate,
      getDataListModel: taskLogModel.getLogs,
      deleteDataModel: taskLogModel.deleteLog,
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
      tasks:[],
      status:[
        {
          title:'正常',
          status:0
        },
        {
          title:'异常',
          status:1
        }
      ],
      loginAddOrUpdateVisible: false,
      historyVisible: false,
    })

    taskModel.getTasks().then((result) => {
      data.tasks = result.map(item=>{
        return {
          title:item.title,
          id:item.id,
        }
      })
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

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
.btn-area button{
  margin-bottom: 4px;
}
</style>
