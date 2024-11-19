<template>
  <div class="app-container">
    <div class="page-header">
      <div class="title-wrapper">
        <h2 class="page-title">资产盘点</h2>
        <span class="page-subtitle">管理和执行资产盘点任务</span>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleCreateTask">创建盘点任务</el-button>
    </div>

    <!-- 数据概览卡片 -->
    <div class="data-overview">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-number">{{ inventoryList.length }}</div>
        <div class="stat-label">总任务数</div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-number">1</div>
        <div class="stat-label">进行中</div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-number">1</div>
        <div class="stat-label">已完成</div>
      </el-card>
    </div>

    <!-- 盘点任务列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="inventoryList"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="taskNo" label="任务编号" width="120" />
        <el-table-column prop="taskName" label="任务名称" width="180" />
        <el-table-column prop="department" label="盘点部门" width="150" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row.status === '进行中' ? 'primary' : scope.row.status === '已完成' ? 'success' : 'info'"
              effect="dark"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template slot-scope="scope">
            <el-progress 
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.progress)"
              :stroke-width="15"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button-group>
              <el-button 
                type="primary" 
                size="mini" 
                icon="el-icon-position" 
                @click="handleInventory(scope.row)"
              >盘点</el-button>
              <el-button 
                type="info" 
                size="mini" 
                icon="el-icon-document" 
                @click="handleViewResult(scope.row)"
              >结果</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建盘点任务对话框 -->
    <el-dialog 
      title="创建盘点任务" 
      :visible.sync="dialogVisible" 
      width="650px"
      custom-class="custom-dialog inventory-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-header-tips">
          请填写盘点任务信息，创建后可立即开始盘点或稍后执行
        </div>
        
        <el-form 
          ref="taskForm" 
          :model="taskForm" 
          label-width="100px" 
          class="task-form"
          :rules="taskRules"
        >
          <el-form-item label="任务名称" prop="taskName">
            <el-input 
              v-model="taskForm.taskName" 
              placeholder="请输入任务名称"
              clearable
            >
              <i slot="prefix" class="el-icon-edit"></i>
            </el-input>
          </el-form-item>
          
          <el-form-item label="盘点部门" prop="department">
            <el-select 
              v-model="taskForm.department" 
              placeholder="请选择部门"
              class="full-width"
            >
              <el-option
                v-for="dept in departments"
                :key="dept.value"
                :label="dept.label"
                :value="dept.value"
              >
                <span style="float: left">
                  <i class="el-icon-office-building" style="margin-right: 8px"></i>
                  {{ dept.label }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="盘点日期" prop="dateRange">
            <el-date-picker
              v-model="taskForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              class="full-width"
            />
          </el-form-item>
          
          <el-form-item label="盘点方式" prop="method">
            <el-radio-group v-model="taskForm.method">
              <el-radio label="rfid">
                <i class="el-icon-connection"></i>
                RFID扫描
              </el-radio>
              <el-radio label="barcode">
                <i class="el-icon-price-tag"></i>
                条码扫描
              </el-radio>
              <el-radio label="manual">
                <i class="el-icon-notebook-2"></i>
                人工盘点
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="taskForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入盘点任务备注信息（选填）"
            />
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createTask" :loading="creating">
          创建任务
        </el-button>
      </div>
    </el-dialog>

    <!-- 执行盘点对话框 -->
    <el-dialog 
      title="执行盘点" 
      :visible.sync="inventoryDialogVisible" 
      width="800px"
      custom-class="custom-dialog"
    >
      <div class="inventory-scanner">
        <el-input
          v-model="scanCode"
          placeholder="请扫描资产标签或输入资产编号"
          @keyup.enter.native="handleScan"
          class="scanner-input"
        >
          <el-button slot="append" type="primary" icon="el-icon-position" @click="handleScan">扫描</el-button>
        </el-input>
      </div>
      <el-table 
        :data="scannedAssets" 
        border 
        style="margin-top: 20px"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="assetNo" label="资产编号" width="120" />
        <el-table-column prop="assetName" label="资产名称" width="180" />
        <el-table-column prop="location" label="所在位置" width="150" />
        <el-table-column prop="status" label="盘点状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '已盘' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 查看盘点结果对话框 -->
    <el-dialog 
      :title="currentTask ? `${currentTask.taskName} - 盘点结果` : '盘点结果'"
      :visible.sync="resultDialogVisible" 
      width="900px"
      custom-class="custom-dialog result-dialog"
    >
      <div class="result-content">
        <!-- 盘点结果统计卡片 -->
        <div class="result-statistics">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" class="result-card">
                <div class="result-icon">
                  <i class="el-icon-document-checked"></i>
                </div>
                <div class="result-data">
                  <div class="result-number">{{ resultStats.total }}</div>
                  <div class="result-label">应盘总数</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="result-card">
                <div class="result-icon success">
                  <i class="el-icon-circle-check"></i>
                </div>
                <div class="result-data">
                  <div class="result-number">{{ resultStats.normal }}</div>
                  <div class="result-label">盘点正常</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="result-card">
                <div class="result-icon warning">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="result-data">
                  <div class="result-number">{{ resultStats.abnormal }}</div>
                  <div class="result-label">存在异常</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="result-card">
                <div class="result-icon danger">
                  <i class="el-icon-remove"></i>
                </div>
                <div class="result-data">
                  <div class="result-number">{{ resultStats.missing }}</div>
                  <div class="result-label">未盘到</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 盘点结果过滤器 -->
        <div class="result-filter">
          <el-radio-group v-model="resultFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="abnormal">异常</el-radio-button>
            <el-radio-button label="missing">未盘到</el-radio-button>
          </el-radio-group>
          
          <el-input
            v-model="resultSearch"
            placeholder="搜索资产编号/名称"
            style="width: 200px; margin-left: 16px"
            size="small"
            clearable
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </div>

        <!-- 盘点结果表格 -->
        <el-table 
          :data="filteredResultList" 
          border 
          style="width: 100%; margin-top: 16px"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="assetNo" label="资产编号" width="120" />
          <el-table-column prop="assetName" label="资产名称" width="180" />
          <el-table-column prop="category" label="资产分类" width="120" />
          <el-table-column prop="department" label="所属部门" width="120" />
          <el-table-column prop="location" label="所在位置" width="150" />
          <el-table-column prop="status" label="盘点状态" width="100">
            <template slot-scope="scope">
              <el-tag 
                :type="scope.row.status === 'normal' ? 'success' : scope.row.status === 'abnormal' ? 'warning' : 'danger'"
                effect="dark"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredResultList.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetInventory',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      inventoryDialogVisible: false,
      resultDialogVisible: false,
      currentTask: null,
      resultFilter: 'all',
      resultSearch: '',
      currentPage: 1,
      pageSize: 10,
      creating: false,
      scanCode: '',
      departments: [
        { label: '信息中心', value: '信息中心' },
        { label: '教务处', value: '教务处' },
        { label: '图书馆', value: '图书馆' },
        { label: '实验室', value: '实验室' },
        { label: '行政办公室', value: '行政办公室' }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      taskRules: {
        taskName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择盘点部门', trigger: 'change' }
        ],
        dateRange: [
          { required: true, message: '请选择盘点日期范围', trigger: 'change' }
        ],
        method: [
          { required: true, message: '请选择盘点方式', trigger: 'change' }
        ]
      },
      taskForm: {
        taskName: '',
        department: '',
        dateRange: [],
        method: 'rfid',
        remark: ''
      },
      resultStats: {
        total: 156,
        normal: 142,
        abnormal: 8,
        missing: 6
      },
      resultList: [
        {
          assetNo: 'ZC2024001',
          assetName: 'ThinkPad X1 Carbon',
          category: '笔记本电脑',
          department: '信息中心',
          location: '信息中心1楼',
          status: 'normal',
          remark: ''
        },
        {
          assetNo: 'ZC2024002',
          assetName: 'Dell PowerEdge服务器',
          category: '服务器',
          department: '信息中心',
          location: '机房',
          status: 'abnormal',
          remark: '设备位置与登记不符'
        },
        {
          assetNo: 'ZC2024003',
          assetName: '华为交换机',
          category: '网络设备',
          department: '信息中心',
          location: '未知',
          status: 'missing',
          remark: '未找到设备'
        }
      ],
      inventoryList: [
        {
          taskNo: 'PD202403001',
          taskName: '信息中心年度盘点',
          department: '信息中心',
          startDate: '2024-03-01',
          endDate: '2024-03-15',
          status: '进行中',
          progress: 45
        },
        {
          taskNo: 'PD202402001',
          taskName: '教务处设备盘点',
          department: '教务处',
          startDate: '2024-02-15',
          endDate: '2024-02-28',
          status: '已完成',
          progress: 100
        }
      ],
      scannedAssets: [
        {
          assetNo: 'ZC2024001',
          assetName: 'ThinkPad笔记本',
          location: '信息中心1楼',
          status: '已盘'
        }
      ]
    }
  },
  computed: {
    filteredResultList() {
      let results = this.resultList
      
      if (this.resultFilter !== 'all') {
        results = results.filter(item => item.status === this.resultFilter)
      }
      
      if (this.resultSearch) {
        const keyword = this.resultSearch.toLowerCase()
        results = results.filter(item => 
          item.assetNo.toLowerCase().includes(keyword) ||
          item.assetName.toLowerCase().includes(keyword)
        )
      }
      
      return results
    }
  },
  methods: {
    handleCreateTask() {
      this.dialogVisible = true
    },
    createTask() {
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          this.creating = true
          setTimeout(() => {
            const newTask = {
              taskNo: 'PD' + new Date().getTime(),
              taskName: this.taskForm.taskName,
              department: this.taskForm.department,
              startDate: this.taskForm.dateRange[0],
              endDate: this.taskForm.dateRange[1],
              status: '未开始',
              progress: 0
            }
            this.inventoryList.unshift(newTask)
            this.dialogVisible = false
            this.creating = false
            this.$message.success('创建盘点任务成功')
            
            this.$refs.taskForm.resetFields()
          }, 1000)
        }
      })
    },
    handleInventory(row) {
      this.currentTask = row
      this.inventoryDialogVisible = true
    },
    handleViewResult(row) {
      this.currentTask = row
      this.resultDialogVisible = true
    },
    handleScan() {
      if (!this.scanCode) {
        this.$message.warning('请输入资产编号')
        return
      }
      const newAsset = {
        assetNo: this.scanCode,
        assetName: '新扫描设备',
        location: '当前位置',
        status: '已盘'
      }
      this.scannedAssets.unshift(newAsset)
      this.scanCode = ''
      this.$message.success('扫描成功')
    },
    getStatusText(status) {
      const statusMap = {
        normal: '正常',
        abnormal: '异常',
        missing: '未盘到'
      }
      return statusMap[status] || status
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    getProgressStatus(progress) {
      if (progress === 100) {
        return 'success'
      } else if (progress > 0) {
        return 'exception'
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #303133;
}

.page-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

.data-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.table-card {
  margin-bottom: 20px;
}

.inventory-scanner {
  width: 500px;
  margin: 0 auto 20px;
}

.scanner-input :deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
}

.scanner-input :deep(.el-input-group__append) {
  padding: 0 15px;
}

.custom-dialog {
  border-radius: 8px;
}

.custom-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.task-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.task-form :deep(.el-input__inner),
.task-form :deep(.el-select),
.task-form :deep(.el-date-editor) {
  width: 100%;
}

/* 添加一些动画效果 */
.el-button {
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-tag {
  transition: all 0.3s;
}

.el-tag:hover {
  transform: scale(1.05);
}
</style> 