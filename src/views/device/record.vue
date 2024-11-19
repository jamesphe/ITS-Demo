<template>
  <div class="app-container">
    <el-card class="record-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <i class="el-icon-document"></i>
          <span class="header-title">设备借用申请记录</span>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" size="small">
          <el-form-item label="申请编号">
            <el-input
              v-model="searchForm.id"
              placeholder="请输入申请编号"
              clearable
              prefix-icon="el-icon-document"
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
          <el-form-item label="申请状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <i :class="item.icon" class="status-icon"></i>
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间">
            <el-date-picker
              v-model="searchForm.timeRange"
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

      <!-- 记录列表 -->
      <el-table
        v-loading="loading"
        :data="recordList"
        border
        style="width: 100%"
        class="record-table"
      >
        <el-table-column prop="id" label="申请编号" width="150" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column label="申请人信息" width="250">
          <template slot-scope="scope">
            <div class="applicant-info">
              <div>
                <span>{{ scope.row.applicant }}</span>
                <el-tag size="mini" type="info">{{ scope.row.userType }}</el-tag>
                <el-tag size="mini" type="warning">{{ scope.row.userCode }}</el-tag>
              </div>
              <div class="department-info">{{ scope.row.department }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="教学用途" width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getPurposeType(scope.row.purpose)">
              {{ scope.row.purpose }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借用时间" width="280">
          <template slot-scope="scope">
            <div>{{ scope.row.startTime }} 至</div>
            <div>{{ scope.row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark">
              <i :class="getStatusIcon(scope.row.status)"></i>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleDetail(scope.row)"
            >
              查看详情
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

      <!-- 详情对话框 -->
      <el-dialog
        title="申请详情"
        :visible.sync="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
      >
        <div v-loading="detailLoading" class="detail-content">
          <template v-if="currentDetail.id">
            <div class="detail-header">
              <div class="detail-id">申请编号：{{ currentDetail.id }}</div>
              <el-tag 
                :type="getStatusType(currentDetail.status)"
                effect="dark"
              >
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </div>
            
            <div class="detail-body">
              <div class="detail-section">
                <div class="section-title">基本信息</div>
                <div class="detail-item">
                  <span class="label">设备名称：</span>
                  <span class="value">{{ currentDetail.deviceName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">申请人：</span>
                  <span class="value">{{ currentDetail.applicant }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">所属院系：</span>
                  <span class="value">{{ currentDetail.department }}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="section-title">时间信息</div>
                <div class="detail-item">
                  <span class="label">申请时间：</span>
                  <span class="value">{{ currentDetail.applyTime }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">借用时间：</span>
                  <span class="value">{{ currentDetail.startTime }} 至 {{ currentDetail.endTime }}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="section-title">借用信息</div>
                <div class="detail-item">
                  <span class="label">使用地点：</span>
                  <span class="value">{{ currentDetail.location }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">借用用途：</span>
                  <span class="value">{{ currentDetail.purpose }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">借用说明：</span>
                  <span class="value">{{ currentDetail.reason }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceRecord',
  data() {
    return {
      loading: false,
      searchForm: {
        id: '',
        deviceName: '',
        status: '',
        timeRange: []
      },
      // 状态选项
      statusOptions: [
        { label: '待审核', value: 'pending', icon: 'el-icon-time' },
        { label: '已审核', value: 'approved', icon: 'el-icon-check' },
        { label: '已领取', value: 'received', icon: 'el-icon-box' },
        { label: '使用中', value: 'using', icon: 'el-icon-loading' },
        { label: '已归还', value: 'returned', icon: 'el-icon-circle-check' }
      ],
      // 记录列表数据
      recordList: [
        {
          id: 'AP202403150001',
          deviceName: '多媒体投影仪 EP-01',
          applicant: '张三',
          userType: '教师',
          userCode: 'T2024001',
          department: '计算机科学与技术学院',
          purpose: '课堂教学',
          location: '教学楼A201',
          reason: '用于数据结构课程教学',
          applyTime: '2024-03-15 10:30:00',
          startTime: '2024-03-16',
          endTime: '2024-03-23',
          status: 'pending'
        },
        // ... 其他记录数据
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      detailLoading: false,
      currentDetail: {}
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
    // 获取状态图标
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
    // 获取用途类型
    getPurposeType(purpose) {
      const typeMap = {
        '课堂教学': 'success',
        '实验教学': 'warning',
        '学术报告': 'primary',
        '学生活动': 'info'
      }
      return typeMap[purpose]
    },
    // 搜索
    handleSearch() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        id: '',
        deviceName: '',
        status: '',
        timeRange: []
      }
      this.handleSearch()
    },
    // 查看详情
    handleDetail(row) {
      this.detailLoading = true
      this.dialogVisible = true
      setTimeout(() => {
        this.currentDetail = { ...row }
        this.detailLoading = false
      }, 300)
    },
    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.handleSearch()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.handleSearch()
    }
  }
}
</script>

<style scoped>
.record-card {
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

.record-table {
  margin-bottom: 20px;
}

.applicant-info {
  line-height: 1.5;
}

.applicant-info .el-tag {
  margin-left: 5px;
}

.department-info {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.pagination-container {
  text-align: right;
  padding: 20px 0;
}

/* 详情对话框样式 */
.detail-content {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
}

.detail-item .label {
  width: 100px;
  color: #909399;
}

.detail-item .value {
  flex: 1;
  color: #303133;
}

.status-icon {
  margin-right: 5px;
}
</style> 