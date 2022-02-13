<template>
  <div class="container">
    <el-row class="container-header" justify="space-between">
      <el-col :span="15">
        <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-select v-model="dataForm.task_id" class="m-2" placeholder="任务名称" clearable>
              <el-option v-for="item in tasks" :key="item.id" :label="item.title" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="dataForm.status" class="m-2" placeholder="运行状态" clearable>
              <el-option v-for="item in status" :key="item.status" :label="item.title" :value="item.status">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="6" class="btn-group">
        <div>
          <el-button icon="el-icon-picture" size="small" type="danger" @click="getErrorList(dataForm)"
            >异常图片</el-button
          >
          <el-button icon="el-icon-search" @click="getDataList(dataForm)">查询</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="wrap content">
      <article>
        <section v-for="log in dataList" :key="log.id">
          <span :class="log.status == 0 ? 'point-time' : 'point-time-error'"></span>
          <aside>
            <p class="things">{{ log.message }}</p>
            <p class="brief">
              <span class="text-yellow">{{ log.crawler_task ? log.crawler_task.title : '' }}</span>
              {{ $filters.dateTimeFormatter(log.create_time) }}
              <span
                style="vertical-align: baseline;padding-left:4px;color:#33cea8;cursor: pointer;"
                @click="addOrUpdateHandle(log.id)"
                >详情</span
              >
            </p>
          </aside>
        </section>
      </article>

      <div v-if="!dataList.length">
        <div v-if="dataList?.length">
          <el-divider></el-divider>
          <div class="more">
            <span>暂无数据</span>
          </div>
        </div>
        <div class="nothing" v-else>暂无日志信息</div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pages">
      <el-pagination
        background
        slot="footer"
        :current-page="page"
        :page-sizes="[10, 30, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChangeHandle"
        @current-change="pageCurrentChangeHandle"
      ></el-pagination>
    </div>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList(dataForm)" />

    <el-dialog v-model="dialogVisible" title="异常截图(最近20张)">
      <div class="boxs">
        <el-image
          v-for="(item,index) in imgs"
          :key="index"
          style="width: 100px; height: 100px;margin:4px"
          :src="item"
          :preview-src-list="imgs"
          :initial-index="4"
          fit="cover"
        >
        </el-image>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="delErrImgLog">清空</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, toRefs, ref, nextTick, onMounted } from 'vue'

import logModel from '@/model/log-run'
import taskModel from '@/model/task'
import mixinViewModule from '@/common/mixin/view-module'
import AddOrUpdate from './log-run-add-or-update.vue'

export default {
  components: {
    AddOrUpdate,
  },
  setup() {
    const addOrUpdate = ref(null)
    const loginAddOrUpdate = ref(null)
    const dialogVisible = ref(false)
    const mixinModuleOptions = {
      getDataListIsPage: true,
      addOrUpdate,
      getDataListModel: logModel.getLogs,
      deleteDataModel: logModel.deleteLog,
    }

    const {
      initMixinViewModuleOptions,
      getDataList,
      deleteHandle,
      addOrUpdateHandle,
      addOrUpdateVisible,
      dataListLoading,
      dataList,
      total,
      page,
      limit,
      pageSizeChangeHandle,
      pageCurrentChangeHandle,
    } = mixinViewModule()

    const data = reactive({
      dataForm: {},
      tasks: [],
      status: [
        {
          title: '正常',
          status: 0,
        },
        {
          title: '异常',
          status: 1,
        },
      ],
      loginAddOrUpdateVisible: false,
      img: '',
      imgs: '',
    })

    onMounted(() => {
      taskModel.getTasks().then(result => {
        data.tasks = result.map(item => {
          return {
            title: item.title,
            id: item.id,
          }
        })
      })
    })

    initMixinViewModuleOptions(mixinModuleOptions, data.dataForm)

    const loginHandle = id => {
      data.loginAddOrUpdateVisible = true
      nextTick(() => {
        loginAddOrUpdate.value.dataForm.id = id
        loginAddOrUpdate.value.init()
      })
    }

    const getErrorList = id => {
      dialogVisible.value = true
      logModel.getErrImgLog().then(result => {
        if (result.length) {
          data.img = result[0]
          data.imgs = result
        }
      })
    }

    const delErrImgLog = id => {
      logModel.delErrImgLog().then(result => {
         dialogVisible.value = false
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
      total,
      page,
      limit,
      pageSizeChangeHandle,
      pageCurrentChangeHandle,
      dialogVisible,
      getErrorList,
      delErrImgLog,
      loginHandle,
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
.content {
  padding: 40px 60px;

  article {
    position: relative;
    margin-bottom: -24px;

    section {
      padding: 0 0 36px;
      position: relative;

      &:before {
        content: '';
        width: 1px;
        top: 7px;
        bottom: -17px;
        left: 10.5px;
        background: #f3f3f3;
        position: absolute;
      }

      &:last-child:before {
        display: none;
      }

      .point-time {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        top: 2px;
        left: 10px;
        background: $theme;
        margin-left: -4px;
        border-radius: 50%;
      }

      .point-time-error {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        top: 2px;
        left: 10px;
        background: red;
        margin-left: -4px;
        border-radius: 50%;
      }

      time {
        width: 15%;
        display: block;
        position: absolute;

        span {
          display: block;
          text-align: right;
        }
      }

      aside {
        color: #45526b;
        margin-left: 30px;

        .things {
          font-size: 14px;
          color: #45526b;
          margin-bottom: 15px;
        }
      }

      .text-yellow {
        color: #8c98ae;
        font-size: 14px;
        line-height: 20px;
        padding-right: 30px;
        float: left;
      }

      .brief {
        font-size: 14px;
        color: #c4c9d2;
        height: 20px;
        line-height: 20px;
      }
    }
  }
}
.nothing {
  height: 80px;
  line-height: 80px;
}
.content {
  height: 70vh;
  overflow: auto;
}
</style>
