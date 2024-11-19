<template>
  <div class="app-container">
    <el-card class="process-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <i class="el-icon-time"></i>
          <span class="header-title">进行中的设备申请</span>
        </div>
        <el-button
          class="refresh-button"
          type="text"
          @click="refreshList"
          :loading="loading"
        >
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="设备名称">
            <el-input
              v-model="searchForm.deviceName"
              placeholder="请输入设备名称"
              clearable
              prefix-icon="el-icon-monitor"
            />
          </el-form-item>
          <el-form-item label="申请状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="��审核" value="pending">
                <i class="el-icon-time status-icon"></i> 待审核
              </el-option>
              <el-option label="已审核" value="approved">
                <i class="el-icon-check status-icon"></i> 已审核
              </el-option>
              <el-option label="已领取" value="received">
                <i class="el-icon-box status-icon"></i> 已领取
              </el-option>
              <el-option label="使用中" value="using">
                <i class="el-icon-loading status-icon"></i> 使用中
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
            <el-button @click="resetSearch" icon="el-icon-refresh-left">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 申请列表 -->
      <el-table
        v-loading="loading"
        :data="applicationList"
        border
        style="width: 100%"
        class="application-table"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="申请编号" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="id-column">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备名称" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="device-name">
              <i class="el-icon-monitor device-icon"></i>
              {{ scope.row.deviceName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="借用人信息" width="320">
          <template slot-scope="scope">
            <div class="borrower-info">
              <div class="borrower-main">
                <i class="el-icon-user"></i>
                <span class="borrower-name">{{ scope.row.applicant }}</span>
                <el-tag size="mini" type="info" class="user-type">{{ scope.row.userType }}</el-tag>
                <el-tag size="mini" type="warning" class="user-code">{{ scope.row.userCode }}</el-tag>
              </div>
              <div class="borrower-sub">
                <span class="department">
                  <i class="el-icon-office-building"></i>
                  {{ scope.row.department }}
                </span>
                <el-divider direction="vertical"></el-divider>
                <span class="major">
                  <i class="el-icon-reading"></i>
                  {{ scope.row.major }}
                </span>
              </div>
              <div class="borrower-contact">
                <span class="phone">
                  <i class="el-icon-phone"></i>
                  {{ scope.row.phone }}
                </span>
                <el-divider direction="vertical"></el-divider>
                <span class="email">
                  <i class="el-icon-message"></i>
                  {{ scope.row.email }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="借用用途" width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getPurposeType(scope.row.purpose)">
              {{ scope.row.purpose }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time time-icon"></i>
            {{ scope.row.applyTime }}
          </template>
        </el-table-column>
        <el-table-column label="借用期限" width="300">
          <template slot-scope="scope">
            <div class="time-range">
              <span class="time-label">从</span>
              {{ scope.row.startTime }}
              <span class="time-separator">至</span>
              {{ scope.row.endTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="dark"
              class="status-tag"
            >
              <i :class="getStatusIcon(scope.row.status)"></i>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button
                size="mini"
                type="primary"
                plain
                @click="handleDetail(scope.row)"
                class="operation-button"
              >
                <i class="el-icon-document"></i> 详情
              </el-button>
              <el-button
                v-if="scope.row.status === 'approved'"
                size="mini"
                type="success"
                plain
                @click="handleReceive(scope.row)"
                class="operation-button"
              >
                <i class="el-icon-box"></i> 确认领取
              </el-button>
              <el-button
                v-if="scope.row.status === 'using'"
                size="mini"
                type="warning"
                plain
                @click="handleReturn(scope.row)"
                class="operation-button"
              >
                <i class="el-icon-back"></i> 申请归还
              </el-button>
            </div>
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

      <!-- 详情对话框 -->
      <el-dialog 
        title="申请详情" 
        :visible.sync="dialogVisible" 
        width="600px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @closed="handleDialogClosed"
      >
        <div v-loading="detailLoading" class="detail-wrapper">
          <template v-if="currentDetail.id">
            <!-- 申请编号和状态 -->
            <div class="detail-header">
              <div class="detail-id">申请编号：{{ currentDetail.id }}</div>
              <el-tag 
                :type="getStatusType(currentDetail.status)"
                effect="dark"
              >
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </div>

            <!-- 基本信息 -->
            <div class="detail-section">
              <div class="section-title">
                <i class="el-icon-info"></i> 基本信息
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="设备名称">{{ currentDetail.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="申请人">{{ currentDetail.applicant }}</el-descriptions-item>
                <el-descriptions-item label="所属院系">{{ currentDetail.department }}</el-descriptions-item>
                <el-descriptions-item label="专业">{{ currentDetail.major }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ currentDetail.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ currentDetail.email }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 借用信息 -->
            <div class="detail-section">
              <div class="section-title">
                <i class="el-icon-time"></i> 借用信息
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="申请时间">{{ currentDetail.applyTime }}</el-descriptions-item>
                <el-descriptions-item label="借用时间">
                  {{ currentDetail.startTime }} 至 {{ currentDetail.endTime }}
                </el-descriptions-item>
                <el-descriptions-item label="使用地点">{{ currentDetail.location }}</el-descriptions-item>
                <el-descriptions-item label="借用用途">
                  <el-tag size="small" :type="getPurposeType(currentDetail.purpose)">
                    {{ currentDetail.purpose }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="借用说明">{{ currentDetail.reason }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 操作按钮 -->
            <div v-if="currentDetail.status !== 'returned'" class="detail-footer">
              <el-button
                v-if="currentDetail.status === 'approved'"
                type="success"
                @click="handleDetailReceive"
              >
                确认领取
              </el-button>
              <el-button
                v-if="currentDetail.status === 'using'"
                type="warning"
                @click="handleDetailReturn"
              >
                申请归还
              </el-button>
            </div>
          </template>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog">关闭</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceProcess',
  data() {
    return {
      loading: false,
      searchForm: {
        deviceName: '',
        status: ''
      },
      applicationList: [
        {
          id: 'AP202403150001',
          deviceName: '多媒体投影仪 EP-01',
          applicant: '张三',
          userType: '教师',
          userCode: 'T2024001',
          department: '计算机科学与技术学院',
          major: '软件工程',
          phone: '13800138000',
          email: 'zhangsan@university.edu.cn',
          purpose: '课堂教学',
          location: '教学楼A201',
          reason: '用于数据结构课程教学',
          applyTime: '2024-03-15 10:30:00',
          startTime: '2024-03-16',
          endTime: '2024-03-23',
          status: 'pending'
        },
        {
          id: 'AP202403150002',
          deviceName: '示波器 OS-01',
          applicant: '李四',
          userType: '学生',
          userCode: 'S202401023',
          department: '电子工程学院',
          major: '通信工程',
          phone: '13900139000',
          email: 'lisi@university.edu.cn',
          purpose: '实验教学',
          location: '实验楼B302',
          reason: '数字电路实验课程使用',
          applyTime: '2024-03-15 11:20:00',
          startTime: '2024-03-17',
          endTime: '2024-03-24',
          status: 'approved'
        },
        {
          id: 'AP202403150003',
          deviceName: '便携式笔记本 LT-01',
          applicant: '王五',
          userType: '教师',
          userCode: 'T2024002',
          department: '计算机科学与技术学院',
          major: '人工智能',
          phone: '13700137000',
          email: 'wangwu@university.edu.cn',
          purpose: '学术报告',
          location: '报告厅C101',
          reason: '学术讲座使用',
          applyTime: '2024-03-15 14:15:00',
          startTime: '2024-03-18',
          endTime: '2024-03-19',
          status: 'using'
        },
        {
          id: 'AP202403150004',
          deviceName: '投影仪 PR-02',
          applicant: '赵六',
          userType: '学生',
          userCode: 'S202401024',
          department: '信息工程学院',
          major: '信息安全',
          phone: '13600136000',
          email: 'zhaoliu@university.edu.cn',
          purpose: '学生活动',
          location: '活动中心D201',
          reason: '学生社团活动使用',
          applyTime: '2024-03-15 15:30:00',
          startTime: '2024-03-19',
          endTime: '2024-03-20',
          status: 'pending'
        }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 3,
      dialogVisible: false,
      detailLoading: false,
      currentDetail: {
        id: '',
        deviceName: '',
        applicant: '',
        department: '',
        purpose: '',
        location: '',
        reason: '',
        applyTime: '',
        startTime: '',
        endTime: '',
        status: ''
      }
    }
  },
  methods: {
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        pending: 'info',
        approved: 'success',
        received: 'warning',
        using: 'primary',
        returned: ''
      }
      return statusMap[status]
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已审核',
        received: '已领取',
        using: '使用中',
        returned: '已归还'
      }
      return statusMap[status]
    },
    // 刷新列表
    refreshList() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$message({
          type: 'success',
          message: '刷新成功'
        })
      }, 500)
    },
    // 搜索
    handleSearch() {
      this.pageNum = 1
      this.refreshList()
    },
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        deviceName: '',
        status: ''
      }
      this.handleSearch()
    },
    // 查看详情
    handleDetail(row) {
      this.detailLoading = true
      this.dialogVisible = true
      
      // 模拟加载数据
      setTimeout(() => {
        this.currentDetail = JSON.parse(JSON.stringify(row))
        this.detailLoading = false
      }, 300)
    },
    // 详情弹窗中的确认领取
    handleDetailReceive() {
      this.$confirm('确认已领取该设备？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 更新列表中的状态
        const targetRow = this.applicationList.find(item => item.id === this.currentDetail.id)
        if (targetRow) {
          targetRow.status = 'using'
          this.currentDetail.status = 'using'
        }
        this.$message({
          type: 'success',
          message: '确认领取成功！'
        })
      }).catch(() => {})
    },
    // 详情弹窗中的申请归还
    handleDetailReturn() {
      this.$confirm('确认要归还该设备？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 更新列表中的状态
        const targetRow = this.applicationList.find(item => item.id === this.currentDetail.id)
        if (targetRow) {
          targetRow.status = 'returned'
          this.currentDetail.status = 'returned'
        }
        this.$message({
          type: 'success',
          message: '申请归还成功！'
        })
      }).catch(() => {})
    },
    // 关闭弹窗
    closeDialog() {
      this.$confirm('确认关闭详情？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogVisible = false
      }).catch(() => {})
    },
    // 弹窗完全关后的回调
    handleDialogClosed() {
      this.currentDetail = {
        id: '',
        deviceName: '',
        applicant: '',
        department: '',
        purpose: '',
        location: '',
        reason: '',
        applyTime: '',
        startTime: '',
        endTime: '',
        status: ''
      }
    },
    // 确认领取
    handleReceive(row) {
      this.$confirm('确认已领取该设备？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '确认领取成功！'
        })
        row.status = 'using'
      })
    },
    // 申请归还
    handleReturn(row) {
      this.$confirm('确认要归还该备？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '申请归还成功！'
        })
        row.status = 'returned'
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.refreshList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.refreshList()
    },
    // 新增获取状态图标方法
    getStatusIcon(status) {
      const iconMap = {
        pending: 'el-icon-time',
        approved: 'el-icon-check',
        received: 'el-icon-box',
        using: 'el-icon-loading',
        returned: 'el-icon-circle-check'
      }
      return iconMap[status]
    },
    // 新增获取借用用途对应的类型的方法
    getPurposeType(purpose) {
      const typeMap = {
        '课堂教学': 'success',
        '实验教学': 'warning',
        '学术报告': 'primary',
        '学生活动': 'info',
        '其他用途': ''
      }
      return typeMap[purpose]
    }
  }
}
</script>

<style scoped>
.process-card {
  margin: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left i {
  font-size: 20px;
  color: #409EFF;
  margin-right: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.refresh-button {
  transition: all 0.3s;
}

.refresh-button:hover {
  transform: rotate(180deg);
}

.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-buttons {
  margin-left: 20px;
}

.application-table {
  margin-top: 20px;
  border-radius: 4px;
}

.application-table .operation-buttons {
  display: inline-flex;
  gap: 8px;
}

.device-name {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.time-range {
  white-space: nowrap;
}

.status-tag {
  white-space: nowrap;
}

.operation-button {
  padding: 5px 10px;
}

.operation-button i {
  margin-right: 3px;
}

.el-table .cell {
  white-space: nowrap;
}

.detail-wrapper {
  padding: 20px;
  min-height: 300px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.detail-id {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 5px;
  color: #409EFF;
}

.detail-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  text-align: center;
}

/* 覆盖 el-descriptions 的样式 */
:deep(.el-descriptions-item__label) {
  width: 100px;
  background-color: #fafafa;
}

:deep(.el-descriptions-item__content) {
  padding: 12px 15px;
}

.status-icon {
  margin-right: 5px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .operation-buttons {
    flex-direction: column;
  }
}

.detail-operations {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  text-align: center;
}

.detail-operations .el-button {
  margin: 0 10px;
}

.detail-content {
  min-height: 300px;
}

.reason-box {
  min-height: 60px;
}
</style> 