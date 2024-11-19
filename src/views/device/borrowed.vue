<template>
  <div class="app-container">
    <el-card class="borrowed-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <i class="el-icon-box"></i>
          <span class="header-title">设备领用管理</span>
        </div>
        <div class="header-right">
          <el-button
            type="success"
            size="small"
            icon="el-icon-circle-check"
            @click="handleBatchReturn"
            :disabled="!selectedItems.length"
          >
            批量归还
          </el-button>
          <el-button
            type="warning"
            size="small"
            icon="el-icon-time"
            @click="handleBatchRenew"
            :disabled="!selectedItems.length"
          >
            批量续借
          </el-button>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" size="small">
          <el-form-item label="设备编号">
            <el-input
              v-model="searchForm.deviceCode"
              placeholder="请输入设备编号"
              clearable
              prefix-icon="el-icon-cpu"
            />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input
              v-model="searchForm.deviceName"
              placeholder="请输入设备名称"
              clearable
              prefix-icon="el-icon-monitor"
            />
          </el-form-item>
          <el-form-item label="领用人">
            <el-input
              v-model="searchForm.borrower"
              placeholder="请输入领用人"
              clearable
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item label="到期时间">
            <el-date-picker
              v-model="searchForm.expireDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
            <el-button @click="resetSearch" icon="el-icon-refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 设备列表 -->
      <el-table
        v-loading="loading"
        :data="borrowedList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="deviceCode" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="180">
          <template slot-scope="scope">
            <div class="device-info">
              <i class="el-icon-monitor device-icon"></i>
              {{ scope.row.deviceName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="borrower" label="领用人" width="120">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.department" placement="top">
              <div class="borrower-info">
                <i class="el-icon-user"></i>
                {{ scope.row.borrower }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="borrowTime" label="领用时间" width="160" />
        <el-table-column prop="expireTime" label="到期时间" width="160">
          <template slot-scope="scope">
            <div :class="{ 'expire-warning': isNearExpire(scope.row.expireTime) }">
              {{ scope.row.expireTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getBorrowStatusType(scope.row.status)">
              {{ getBorrowStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              plain
              @click="handleReturn(scope.row)"
              v-if="scope.row.status === 'borrowed'"
            >
              归还
            </el-button>
            <el-button
              size="mini"
              type="warning"
              plain
              @click="handleRenew(scope.row)"
              v-if="scope.row.status === 'borrowed'"
            >
              续借
            </el-button>
            <el-button
              size="mini"
              type="primary"
              plain
              @click="handleDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>

      <!-- 续借对话框 -->
      <el-dialog
        title="设备续借"
        :visible.sync="renewDialogVisible"
        width="500px"
      >
        <div class="renew-form">
          <el-form :model="renewForm" label-width="100px">
            <el-form-item label="当前到期时间">
              <span>{{ currentRenewItem.expireTime }}</span>
            </el-form-item>
            <el-form-item label="续借天数">
              <el-input-number
                v-model="renewForm.days"
                :min="1"
                :max="30"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="续借原因">
              <el-input
                type="textarea"
                v-model="renewForm.reason"
                :rows="3"
                placeholder="请输入续借原因"
              />
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer">
          <el-button @click="renewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRenew">确认续借</el-button>
        </span>
      </el-dialog>

      <!-- 归还对话框 -->
      <el-dialog
        title="设备归还"
        :visible.sync="returnDialogVisible"
        width="500px"
      >
        <div class="return-form">
          <el-form :model="returnForm" label-width="100px">
            <el-form-item label="设备状态">
              <el-radio-group v-model="returnForm.condition">
                <el-radio label="normal">完好</el-radio>
                <el-radio label="damaged">损坏</el-radio>
                <el-radio label="lost">丢失</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注说明">
              <el-input
                type="textarea"
                v-model="returnForm.remark"
                :rows="3"
                placeholder="请输入备注说明"
              />
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer">
          <el-button @click="returnDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReturn">确认归还</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceBorrowed',
  data() {
    return {
      loading: false,
      searchForm: {
        deviceCode: '',
        deviceName: '',
        borrower: '',
        expireDate: []
      },
      borrowedList: [
        {
          deviceCode: 'EP001',
          deviceName: '多媒体投影仪 EP-01',
          borrower: '张三',
          department: '计算机科学与技术学院',
          borrowTime: '2024-03-15',
          expireTime: '2024-04-15',
          status: 'borrowed'
        },
        {
          deviceCode: 'LT002',
          deviceName: '笔记本电脑 LT-01',
          borrower: '李四',
          department: '电子工程学院',
          borrowTime: '2024-03-10',
          expireTime: '2024-03-25',
          status: 'borrowed'
        }
      ],
      selectedItems: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      renewDialogVisible: false,
      returnDialogVisible: false,
      currentRenewItem: {},
      renewForm: {
        days: 7,
        reason: ''
      },
      returnForm: {
        condition: 'normal',
        remark: ''
      }
    }
  },
  methods: {
    handleSearch() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    resetSearch() {
      this.searchForm = {
        deviceCode: '',
        deviceName: '',
        borrower: '',
        expireDate: []
      }
      this.handleSearch()
    },
    handleSelectionChange(val) {
      this.selectedItems = val
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.handleSearch()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.handleSearch()
    },
    getBorrowStatusType(status) {
      const statusMap = {
        borrowed: 'warning',
        returned: 'success',
        overdue: 'danger'
      }
      return statusMap[status]
    },
    getBorrowStatusText(status) {
      const statusMap = {
        borrowed: '已借出',
        returned: '已归还',
        overdue: '已逾期'
      }
      return statusMap[status]
    },
    isNearExpire(expireTime) {
      const expireDate = new Date(expireTime)
      const now = new Date()
      const diffDays = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24))
      return diffDays <= 3 && diffDays > 0
    },
    handleRenew(row) {
      this.currentRenewItem = row
      this.renewDialogVisible = true
    },
    handleReturn(row) {
      this.currentRenewItem = row
      this.returnDialogVisible = true
    },
    handleBatchRenew() {
      this.$message.success(`已选择 ${this.selectedItems.length} 个设备进行续借`)
    },
    handleBatchReturn() {
      this.$message.success(`已选择 ${this.selectedItems.length} 个设备进行归还`)
    },
    submitRenew() {
      this.$message.success('续借申请提交成功')
      this.renewDialogVisible = false
      this.renewForm = {
        days: 7,
        reason: ''
      }
    },
    submitReturn() {
      this.$message.success('设备归还成功')
      this.returnDialogVisible = false
      this.returnForm = {
        condition: 'normal',
        remark: ''
      }
    },
    handleDetail(row) {
      console.log('查看详情:', row)
    }
  }
}
</script>

<style scoped>
.borrowed-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left i {
  font-size: 20px;
  margin-right: 8px;
  color: #409EFF;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.search-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.device-info {
  display: flex;
  align-items: center;
}

.device-icon {
  margin-right: 8px;
  color: #409EFF;
}

.borrower-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.borrower-info i {
  margin-right: 4px;
  color: #909399;
}

.expire-warning {
  color: #E6A23C;
  font-weight: bold;
}

.pagination-container {
  text-align: right;
  padding: 20px 0;
}

.renew-form, .return-form {
  padding: 20px;
}

/* 添加一些动画效果 */
.el-card {
  transition: all 0.3s;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .search-section .el-form {
    display: flex;
    flex-direction: column;
  }
  
  .search-section .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style> 