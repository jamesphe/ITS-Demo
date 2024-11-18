<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="header-title">所有工单</span>
      </div>

      <div class="filter-container">
        <div class="filter-group">
          <el-select v-model="listQuery.status" placeholder="工单状态" clearable class="filter-item">
            <el-option label="未分派" value="unassigned"/>
            <el-option label="处理中" value="processing"/>
            <el-option label="已完成" value="completed"/>
          </el-select>
          <el-select v-model="listQuery.priority" placeholder="优先级" clearable class="filter-item">
            <el-option label="高" value="high"/>
            <el-option label="中" value="medium"/>
            <el-option label="低" value="low"/>
          </el-select>
          <el-date-picker
            v-model="listQuery.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-item date-range-picker"
          />
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            筛选
          </el-button>
        </div>
        <div class="operation-group">
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出报表</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleBatchAssign">批量分派</el-button>
        </div>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center"/>
        <el-table-column label="工单编号" prop="id" align="center" width="90">
          <template slot-scope="{row}">
            <span class="ticket-id">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单标题" min-width="200">
          <template slot-scope="{row}">
            <router-link 
              :to="`/tickets/detail/${row.id}`" 
              class="ticket-title"
            >
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="工单状态" width="90" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusTypeFilter" size="medium">
              {{ row.status | statusFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="150" align="center">
          <template slot-scope="{row}">
            <span class="time-text">{{ row.created_at }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.priority | priorityTypeFilter" size="medium" effect="dark">
              {{ row.priority | priorityFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="{row}">
            <el-button 
              v-if="row.status === 'unassigned'" 
              type="primary" 
              size="mini"
              @click="handleAssign(row)"
            >
              分派
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TicketList',
  filters: {
    statusFilter(status) {
      const statusMap = {
        unassigned: '未分派',
        processing: '处理中',
        completed: '已完成'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        unassigned: 'info',
        processing: 'warning',
        completed: 'success'
      }
      return statusMap[status]
    },
    priorityFilter(priority) {
      const priorityMap = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return priorityMap[priority]
    },
    priorityTypeFilter(priority) {
      const priorityMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return priorityMap[priority]
    }
  },
  data() {
    return {
      list: [
        {
          id: 'W001',
          title: '无法访问共享打印机',
          status: 'unassigned',
          created_at: '2024-11-18 10:30',
          priority: 'high'
        },
        {
          id: 'W002',
          title: '申请新员工电脑配置',
          status: 'processing',
          created_at: '2024-11-17 14:30',
          priority: 'medium'
        },
        {
          id: 'W003',
          title: 'VPN连接异常',
          status: 'completed',
          created_at: '2024-11-16 11:20',
          priority: 'low'
        }
      ],
      total: 3,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        priority: undefined,
        timeRange: undefined
      },
      selectedTickets: []
    }
  },
  methods: {
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    getList() {
      this.listLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSelectionChange(val) {
      this.selectedTickets = val
    },
    handleDetail(row) {
      this.$router.push(`/tickets/detail/${row.id}`)
    },
    handleAssign(row) {
      // 处理分派逻辑
      this.$message.success(`工单 ${row.id} 已分派`)
    },
    handleBatchAssign() {
      if (this.selectedTickets.length === 0) {
        this.$message.warning('请选择要分派的工单')
        return
      }
      this.$message.success(`已选择 ${this.selectedTickets.length} 个工单进行分派`)
    },
    handleExport() {
      this.$message.success('正在导出报表...')
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin-bottom: 20px;
  
  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  
  .filter-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    
    .filter-item {
      width: 120px;
      
      &.date-range-picker {
        width: 260px;
      }
    }
  }
  
  .operation-group {
    display: flex;
    gap: 10px;
  }
}

.el-table {
  margin: 10px 0;
  
  .ticket-id {
    font-family: Monaco, monospace;
    color: #606266;
    font-weight: 500;
  }
  
  .ticket-title {
    color: #606266;
    text-decoration: none;
    
    &:hover {
      color: #409EFF;
      cursor: pointer;
    }
  }
  
  .time-text {
    color: #606266;
    font-size: 13px;
  }
  
  .el-tag {
    border-radius: 2px;
    font-weight: normal;
    
    &.el-tag--danger {
      background-color: rgba(245, 108, 108, 0.1);
      border-color: rgba(245, 108, 108, 0.2);
      color: #f56c6c;
    }
    
    &.el-tag--warning {
      background-color: rgba(230, 162, 60, 0.1);
      border-color: rgba(230, 162, 60, 0.2);
      color: #e6a23c;
    }
    
    &.el-tag--info {
      background-color: rgba(144, 147, 153, 0.1);
      border-color: rgba(144, 147, 153, 0.2);
      color: #909399;
    }
  }
  
  .el-button--mini {
    padding: 6px 12px;
  }
}

.pagination-container {
  padding: 15px 0;
  text-align: right;
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
}

// 响应式布局
@media screen and (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    gap: 15px;
    
    .filter-group, .operation-group {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style> 