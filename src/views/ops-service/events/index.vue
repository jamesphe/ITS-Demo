<template>
  <div class="app-container">
    <el-card class="event-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="header-title">事件管理</span>
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            icon="el-icon-plus"
            @click="handleCreate">
            新建事件
          </el-button>
        </div>
      </div>
      
      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="事件类型" class="form-item">
          <el-select v-model="queryParams.type" 
            placeholder="请选择事件类型" 
            clearable 
            class="filter-select">
            <el-option v-for="item in eventTypes" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="来源" class="form-item">
          <el-select v-model="queryParams.source" 
            placeholder="请选择来源" 
            clearable
            class="filter-select">
            <el-option v-for="item in sourcesTypes" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" class="form-item">
          <el-select v-model="queryParams.status" 
            placeholder="请选择状态" 
            clearable
            class="filter-select">
            <el-option v-for="item in statusTypes" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" class="form-item">
          <el-date-picker
            v-model="queryParams.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            class="date-range-picker"/>
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
          <el-button @click="resetQuery" class="reset-btn">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 事件列表 -->
      <el-table 
        :data="eventList" 
        style="width: 100%" 
        border
        class="event-table"
        :header-cell-style="tableHeaderStyle"
        :cell-style="tableCellStyle">
        <el-table-column prop="eventId" label="事件编号" min-width="120" />
        <el-table-column prop="eventName" label="事件名称" min-width="150" />
        <el-table-column prop="type" label="事件类型" min-width="120" />
        <el-table-column prop="submitTime" label="提交时间" min-width="180" />
        <el-table-column prop="source" label="来源" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)"
              class="status-tag">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              @click="viewDetail(scope.row)"
              class="action-button">
              查看详情
            </el-button>
            <el-button 
              type="text" 
              @click="createTicket(scope.row)"
              class="action-button">
              创建工单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination-container"
        :current-page="queryParams.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EventManagement',
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: '',
        source: '',
        status: '',
        timeRange: []
      },
      // 事件列表数据
      eventList: [],
      // 总记录数
      total: 0,
      // 事件类型选项
      eventTypes: [
        { value: '网络故障', label: '网络故障' },
        { value: '系统崩溃', label: '系统崩溃' },
        { value: '软件安装', label: '软件安装' }
      ],
      // 来源类型选项
      sourcesTypes: [
        { value: '企业邮箱', label: '企业邮箱' },
        { value: '固定电话', label: '固定电话' },
        { value: '手动记录', label: '手动记录' }
      ],
      // 状态选项
      statusTypes: [
        { value: '待处理', label: '待处理' },
        { value: '处理中', label: '处理中' },
        { value: '已解决', label: '已解决' }
      ]
    }
  },
  computed: {
    // 从vuex获取当前用户信息
    currentUser() {
      return this.$store.state.user.userInfo || {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取事件列表
    getList() {
      // 模拟数据，实际项目中应该调用API
      this.eventList = [
        {
          eventId: 'EVT-001',
          eventName: '系统无法访问',
          type: '网络故障',
          submitTime: '2024-11-18 09:45',
          source: '企业邮箱',
          status: '待处理'
        },
        // ... 其他数据
      ]
      this.total = this.eventList.length
    },
    // 查询按钮点击事件
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置按钮点击事件
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        type: '',
        source: '',
        status: '',
        timeRange: []
      }
      this.getList()
    },
    // 查看详情
    viewDetail(row) {
      // 跳转到详情页面
      this.$router.push(`/ops-service/events/detail/${row.eventId}`)
    },
    // 创建工单
    createTicket(row) {
      // 跳转到创建工单页面
      this.$router.push({
        path: '/tickets/create',
        query: { eventId: row.eventId }
      })
    },
    // 获取状态标签类型
    getStatusType(status) {
      const statusMap = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已解决': 'success'
      }
      return statusMap[status] || 'info'
    },
    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    // 处理页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    // 新增的方法
    handleCreate() {
      // 更新路由路径
      this.$router.push('/ops-service/events/create')
    }
  }
}
</script>

<style lang="scss" scoped>
.event-card {
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    
    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.search-form {
  padding: 20px;
  background-color: #f8f9fb;
  border-radius: 4px;
  margin-bottom: 24px;

  .form-item {
    margin-bottom: 16px;
    margin-right: 24px;

    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }
  }

  .filter-select {
    width: 180px;
  }

  .date-range-picker {
    width: 360px;
  }

  .button-group {
    margin-left: 8px;
    
    .search-btn {
      margin-right: 12px;
      padding: 9px 20px;
    }

    .reset-btn {
      padding: 9px 20px;
    }
  }
}

.event-table {
  margin: 16px 0;
  
  ::v-deep .el-table__header-wrapper {
    th {
      background-color: #f5f7fa;
      color: #303133;
      font-weight: 600;
      height: 48px;
    }
  }

  .status-tag {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
  }

  .action-button {
    padding: 4px 8px;
    font-size: 14px;
    
    &:hover {
      color: #409EFF;
      background-color: #ecf5ff;
      border-radius: 4px;
    }

    & + .action-button {
      margin-left: 12px;
    }
  }
}

.pagination-container {
  margin-top: 24px;
  padding: 16px 0;
  text-align: right;
  
  ::v-deep .el-pagination {
    padding: 0;
    font-weight: normal;
    
    .el-pagination__total,
    .el-pagination__sizes {
      margin-right: 16px;
    }
    
    .btn-prev,
    .btn-next {
      padding: 0 8px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
    
    .el-pager li {
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.active {
        background-color: #409EFF;
        color: #fff;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-left {
    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: #1f2f3d;
    }
  }

  .header-right {
    .el-button {
      padding: 9px 16px;
      font-size: 13px;
    }
  }
}
</style> 