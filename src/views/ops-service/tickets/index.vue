<template>
  <div class="app-container">
    <el-card class="ticket-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="header-title">工单管理</span>
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            icon="el-icon-plus"
            @click="handleCreate">
            新建工单
          </el-button>
        </div>
      </div>
      
      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="工单状态" class="form-item">
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
        <el-form-item label="优先级" class="form-item">
          <el-select v-model="queryParams.priority" 
            placeholder="请选择优先级" 
            clearable
            class="filter-select">
            <el-option v-for="item in priorityTypes" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称" class="form-item">
          <el-select v-model="queryParams.serviceName" 
            placeholder="请选择服务" 
            clearable
            class="filter-select">
            <el-option v-for="item in serviceTypes" 
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
          <el-button type="success" @click="exportToExcel" class="export-btn">
            <i class="el-icon-download" />导出报表
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 工单列表 -->
      <el-table 
        :data="ticketList" 
        style="width: 100%" 
        border
        class="ticket-table">
        <el-table-column prop="ticketId" label="工单编号" min-width="100" />
        <el-table-column prop="title" label="工单标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="工单状态" min-width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)"
              class="status-tag">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" min-width="160" />
        <el-table-column prop="priority" label="优先级" min-width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getPriorityType(scope.row.priority)"
              class="priority-tag">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="eventId" label="关联事件" min-width="120">
          <template slot-scope="scope">
            <el-link 
              type="primary" 
              @click="viewEvent(scope.row.eventId)"
              v-if="scope.row.eventId">
              {{ scope.row.eventId }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceName" label="服务名称" min-width="150">
          <template slot-scope="scope">
            <el-tag 
              type="info" 
              effect="plain"
              class="service-tag">
              {{ scope.row.serviceName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              @click="viewDetail(scope.row)"
              class="action-button">
              查看详情
            </el-button>
            <el-button 
              type="text" 
              @click="assignTicket(scope.row)"
              v-if="scope.row.status === '未分派'"
              class="action-button">
              分派工单
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
  name: 'TicketManagement',
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: '',
        priority: '',
        serviceName: '',
        timeRange: []
      },
      // 工单列表数据
      ticketList: [
        {
          ticketId: 'W001',
          title: '系统访问异常处理工单',
          status: '未分派',
          submitTime: '2024-11-18 10:30',
          priority: '高',
          eventId: 'EVT-001',
          serviceName: '系统访问服务'
        },
        {
          ticketId: 'W002',
          title: '网络连接问题处理工单',
          status: '处理中',
          submitTime: '2024-11-17 14:30',
          priority: '中',
          eventId: 'EVT-002',
          serviceName: '网络连接服务'
        },
        {
          ticketId: 'W003',
          title: '软件安装协助工单',
          status: '已解决',
          submitTime: '2024-11-16 11:20',
          priority: '低',
          eventId: 'EVT-003',
          serviceName: '软件安装服务'
        },
        {
          ticketId: 'W004',
          title: '账号权限申请工单',
          status: '已关闭',
          submitTime: '2024-11-15 09:15',
          priority: '中',
          eventId: 'EVT-004',
          serviceName: '账号管理服务'
        }
      ],
      // 总记录数
      total: 4,
      // 状态选项
      statusTypes: [
        { value: '未分派', label: '未分派' },
        { value: '处理中', label: '处理中' },
        { value: '已解决', label: '已解决' },
        { value: '已关闭', label: '已关闭' }
      ],
      // 优先级选项
      priorityTypes: [
        { value: '高', label: '高' },
        { value: '中', label: '中' },
        { value: '低', label: '低' }
      ],
      // 服务类型选项
      serviceTypes: [
        { value: '系统访问服务', label: '系统访问服务' },
        { value: '网络连接服务', label: '网络连接服务' },
        { value: '软件安装服务', label: '软件安装服务' },
        { value: '账号管理服务', label: '账号管理服务' },
        { value: '数据备份服务', label: '数据备份服务' }
      ]
    }
  },
  methods: {
    // 获取状态标签类型
    getStatusType(status) {
      const statusMap = {
        '未分派': 'warning',
        '处理中': 'primary',
        '已解决': 'success',
        '已关闭': 'info'
      }
      return statusMap[status] || 'info'
    },
    // 获取优先级标签类型
    getPriorityType(priority) {
      const priorityMap = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return priorityMap[priority] || 'info'
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
        status: '',
        priority: '',
        serviceName: '',
        timeRange: []
      }
      this.getList()
    },
    // 查看详情
    viewDetail(row) {
      this.$router.push(`/ops-service/tickets/detail/${row.ticketId}`)
    },
    // 分派工单
    assignTicket(row) {
      this.$router.push(`/ops-service/tickets/assign/${row.ticketId}`)
    },
    // 查看关联事件
    viewEvent(eventId) {
      this.$router.push(`/ops-service/events/detail/${eventId}`)
    },
    // 导出报表
    exportToExcel() {
      // 实现导出功能
      this.$message.success('导出成功')
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
    // 获取列表数据
    getList() {
      // 实际项目中这里应该调用API
      console.log('查询参数：', this.queryParams)
    },
    // 添加新建工单方法
    handleCreate() {
      this.$router.push('/ops-service/tickets/create')
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-card {
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    
    .header-left {
      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      .el-button {
        padding: 9px 16px;
        font-size: 14px;
        
        [class^="el-icon-"] {
          margin-right: 6px;
          font-size: 14px;
        }
      }
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
      margin-right: 12px;
      padding: 9px 20px;
    }

    .export-btn {
      padding: 9px 20px;
      
      i {
        margin-right: 6px;
      }
    }
  }
}

.ticket-table {
  margin: 16px 0;
  
  ::v-deep .el-table__header-wrapper {
    th {
      background-color: #f5f7fa;
      color: #303133;
      font-weight: 600;
      height: 48px;
    }
  }

  .status-tag,
  .priority-tag {
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

  .service-tag {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
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
</style> 