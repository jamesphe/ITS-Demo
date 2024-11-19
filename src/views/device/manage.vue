<template>
  <div class="app-container">
    <el-card class="manage-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <i class="el-icon-setting"></i>
          <span class="header-title">设备借用管理</span>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAddDevice"
          >
            添加设备
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="statistics-section">
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <div class="statistics-item">
              <div class="statistics-icon total">
                <i class="el-icon-monitor"></i>
              </div>
              <div class="statistics-info">
                <div class="statistics-title">设备总数</div>
                <div class="statistics-value">{{ statistics.total }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <div class="statistics-item">
              <div class="statistics-icon available">
                <i class="el-icon-box"></i>
              </div>
              <div class="statistics-info">
                <div class="statistics-title">可借设备</div>
                <div class="statistics-value">{{ statistics.available }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <div class="statistics-item">
              <div class="statistics-icon borrowed">
                <i class="el-icon-shopping-cart-full"></i>
              </div>
              <div class="statistics-info">
                <div class="statistics-title">借出设备</div>
                <div class="statistics-value">{{ statistics.borrowed }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <div class="statistics-item">
              <div class="statistics-icon maintenance">
                <i class="el-icon-warning"></i>
              </div>
              <div class="statistics-info">
                <div class="statistics-title">维修中</div>
                <div class="statistics-value">{{ statistics.maintenance }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

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
          <el-form-item label="设备类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in deviceTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="item in deviceStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
        :data="deviceList"
        border
        style="width: 100%"
      >
        <el-table-column prop="deviceCode" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="180">
          <template slot-scope="scope">
            <div class="device-info">
              <i class="el-icon-monitor device-icon"></i>
              {{ scope.row.deviceName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="设备类型" width="120">
          <template slot-scope="scope">
            <el-tag size="mini">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="购入日期" width="120" />
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getDeviceStatusType(scope.row.status)">
              {{ getDeviceStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowCount" label="借用次数" width="100" align="center" />
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              plain
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="success"
              plain
              @click="handleMaintenance(scope.row)"
              v-if="scope.row.status !== 'maintenance'"
            >
              维修登记
            </el-button>
            <el-button
              size="mini"
              type="warning"
              plain
              @click="handleRecord(scope.row)"
            >
              借用记录
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

      <!-- 添加/编辑设备对话框 -->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="600px"
      >
        <el-form :model="deviceForm" label-width="100px" :rules="deviceRules">
          <el-form-item label="设备编号" prop="deviceCode">
            <el-input v-model="deviceForm.deviceCode" placeholder="请输入设备编号" />
          </el-form-item>
          <el-form-item label="设备名称" prop="deviceName">
            <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="设备类型" prop="type">
            <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
              <el-option
                v-for="item in deviceTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="购入日期" prop="purchaseDate">
            <el-date-picker
              v-model="deviceForm.purchaseDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="存放位置" prop="location">
            <el-input v-model="deviceForm.location" placeholder="请输入存放位置" />
          </el-form-item>
          <el-form-item label="设备说明">
            <el-input
              type="textarea"
              v-model="deviceForm.description"
              :rows="3"
              placeholder="请输入设备说明"
            />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDevice">确定</el-button>
        </span>
      </el-dialog>

      <!-- 维修登记对话框 -->
      <el-dialog
        title="维修登记"
        :visible.sync="maintenanceDialogVisible"
        width="500px"
      >
        <el-form :model="maintenanceForm" label-width="100px">
          <el-form-item label="维修原因" prop="reason">
            <el-input
              type="textarea"
              v-model="maintenanceForm.reason"
              :rows="3"
              placeholder="请输入维修原因"
            />
          </el-form-item>
          <el-form-item label="预计时间">
            <el-input-number
              v-model="maintenanceForm.estimatedDays"
              :min="1"
              :max="30"
              label="预计维修天数"
            />
            <span class="unit-text">天</span>
          </el-form-item>
          <el-form-item label="维修备注">
            <el-input
              type="textarea"
              v-model="maintenanceForm.remark"
              :rows="2"
              placeholder="请输入维修备注"
            />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="maintenanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMaintenance">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceManage',
  data() {
    return {
      loading: false,
      statistics: {
        total: 128,
        available: 89,
        borrowed: 35,
        maintenance: 4
      },
      searchForm: {
        deviceCode: '',
        deviceName: '',
        type: '',
        status: ''
      },
      deviceTypes: [
        { label: '教学设备', value: 'teaching' },
        { label: '实验设备', value: 'experiment' },
        { label: '办公设备', value: 'office' }
      ],
      deviceStatus: [
        { label: '可借用', value: 'available' },
        { label: '已借出', value: 'borrowed' },
        { label: '维修中', value: 'maintenance' }
      ],
      deviceList: [
        {
          deviceCode: 'EP001',
          deviceName: '多媒体投影仪 EP-01',
          type: '教学设备',
          purchaseDate: '2023-09-01',
          location: '教学楼A201',
          status: 'available',
          borrowCount: 12
        },
        {
          deviceCode: 'LT002',
          deviceName: '笔记本电脑 LT-01',
          type: '办公设备',
          purchaseDate: '2023-10-15',
          location: '设备室B103',
          status: 'borrowed',
          borrowCount: 8
        }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '添加设备',
      deviceForm: {
        deviceCode: '',
        deviceName: '',
        type: '',
        purchaseDate: '',
        location: '',
        description: ''
      },
      deviceRules: {
        deviceCode: [
          { required: true, message: '请输入设备编号', trigger: 'blur' }
        ],
        deviceName: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入存放位置', trigger: 'blur' }
        ]
      },
      maintenanceDialogVisible: false,
      maintenanceForm: {
        reason: '',
        estimatedDays: 1,
        remark: ''
      }
    }
  },
  methods: {
    getDeviceStatusType(status) {
      const statusMap = {
        available: 'success',
        borrowed: 'warning',
        maintenance: 'danger'
      }
      return statusMap[status]
    },
    getDeviceStatusText(status) {
      const statusMap = {
        available: '可借用',
        borrowed: '已借出',
        maintenance: '维修中'
      }
      return statusMap[status]
    },
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
        type: '',
        status: ''
      }
      this.handleSearch()
    },
    handleAddDevice() {
      this.dialogTitle = '添加设备'
      this.deviceForm = {
        deviceCode: '',
        deviceName: '',
        type: '',
        purchaseDate: '',
        location: '',
        description: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑设备'
      this.deviceForm = { ...row }
      this.dialogVisible = true
    },
    handleMaintenance(row) {
      this.maintenanceForm = {
        reason: '',
        estimatedDays: 1,
        remark: ''
      }
      this.maintenanceDialogVisible = true
    },
    handleRecord(row) {
      this.$message.info('查看借用记录：' + row.deviceCode)
    },
    submitDevice() {
      this.$message.success(this.dialogTitle + '成功')
      this.dialogVisible = false
    },
    submitMaintenance() {
      this.$message.success('维修登记成功')
      this.maintenanceDialogVisible = false
    },
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
.manage-card {
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

.statistics-section {
  margin-bottom: 20px;
}

.statistics-card {
  cursor: pointer;
  transition: all 0.3s;
}

.statistics-card:hover {
  transform: translateY(-2px);
}

.statistics-item {
  display: flex;
  align-items: center;
}

.statistics-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.statistics-icon i {
  font-size: 24px;
  color: #fff;
}

.statistics-icon.total {
  background-color: #409EFF;
}

.statistics-icon.available {
  background-color: #67C23A;
}

.statistics-icon.borrowed {
  background-color: #E6A23C;
}

.statistics-icon.maintenance {
  background-color: #F56C6C;
}

.statistics-info {
  flex: 1;
}

.statistics-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.statistics-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
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

.pagination-container {
  text-align: right;
  padding: 20px 0;
}

.unit-text {
  margin-left: 8px;
  color: #909399;
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
  
  .statistics-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style> 