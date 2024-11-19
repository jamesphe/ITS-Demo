<template>
  <div class="app-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-title">
        <h2>合同管理</h2>
        <div class="header-tip">管理IT资产相关合同及执行进度</div>
      </div>
      <div class="header-action">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增合同</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <el-form :inline="true" :model="searchForm" size="small">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="合同编号/名称"
              clearable
              prefix-icon="el-icon-search"
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.type" placeholder="合同类型" clearable style="width: 160px">
              <el-option label="采购合同" value="purchase" />
              <el-option label="租赁合同" value="lease" />
              <el-option label="维保合同" value="maintenance" />
              <el-option label="服务合同" value="service" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.status" placeholder="合同状态" clearable style="width: 160px">
              <el-option label="执行中" value="active">
                <el-tag size="small" type="success">执行中</el-tag>
              </el-option>
              <el-option label="待审批" value="pending">
                <el-tag size="small" type="warning">待审批</el-tag>
              </el-option>
              <el-option label="已完成" value="completed">
                <el-tag size="small" type="info">已完成</el-tag>
              </el-option>
              <el-option label="已终止" value="terminated">
                <el-tag size="small" type="danger">已终止</el-tag>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 合同列表 -->
    <el-table
      :data="contractList"
      style="width: 100%; margin-top: 20px"
      border
      :header-cell-style="{ background: '#f5f7fa' }"
    >
      <el-table-column prop="contractNo" label="合同编号" width="150" />
      <el-table-column prop="name" label="合同名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="合同类型" width="120">
        <template slot-scope="scope">
          <el-tag size="mini" :type="getContractTypeTag(scope.row.type)">
            {{ scope.row.typeText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" width="180" show-overflow-tooltip />
      <el-table-column prop="amount" label="合同金额" width="150">
        <template slot-scope="scope">
          ￥{{ scope.row.amount.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="合同期限" width="200">
        <template slot-scope="scope">
          {{ scope.row.startDate }} 至 {{ scope.row.endDate }}
        </template>
      </el-table-column>
      <el-table-column label="进度" width="200">
        <template slot-scope="scope">
          <el-progress 
            :percentage="scope.row.progress"
            :type="'line'"
            :stroke-width="10"
          >
            <span>{{ scope.row.progress }}%</span>
          </el-progress>
          <div class="progress-info">
            <span>{{ getProgressText(scope.row) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="mini">
            {{ scope.row.statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button 
            size="mini" 
            type="primary" 
            plain
            @click="handleDetail(scope.row)"
          >
            查看详情
          </el-button>
          <el-button 
            size="mini" 
            type="success" 
            plain
            @click="handleProgress(scope.row)"
          >
            更新进度
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <!-- 更新进度对话框 -->
    <el-dialog
      title="更新进度"
      :visible.sync="progressDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="progress-form" v-if="currentContract">
        <div class="contract-info">
          <p><strong>合同编号：</strong>{{ currentContract.contractNo }}</p>
          <p><strong>合同名称：</strong>{{ currentContract.name }}</p>
        </div>
        <el-form :model="progressForm" label-width="100px">
          <el-form-item label="当前进度">
            <el-slider
              v-model="progressForm.progress"
              :step="5"
              show-stops
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="进度说明">
            <el-input
              type="textarea"
              v-model="progressForm.remark"
              :rows="3"
              placeholder="请输入进度更新说明"
            />
          </el-form-item>
          <el-form-item label="更新日期">
            <el-date-picker
              v-model="progressForm.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitProgress">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 合同详情对话框 -->
    <el-dialog
      title="合同详情"
      :visible.sync="detailDialogVisible"
      width="900px"
      :close-on-click-modal="false"
      custom-class="detail-dialog"
    >
      <!-- 合同基本信息卡片 -->
      <el-card class="detail-card" shadow="never" v-if="currentContract">
        <div class="detail-header">
          <div class="header-left">
            <h3>{{ currentContract.name }}</h3>
            <el-tag :type="getStatusType(currentContract.status)" size="small">
              {{ currentContract.statusText }}
            </el-tag>
          </div>
          <div class="header-right">
            <span class="contract-code">合同编号：{{ currentContract.contractNo }}</span>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="info-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <span class="label">合同类型��</span>
                <el-tag size="small" :type="getContractTypeTag(currentContract.type)">
                  {{ currentContract.typeText }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">合同金额：</span>
                <span class="value amount">￥{{ currentContract.amount.toLocaleString() }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">供应商：</span>
                <span class="value">{{ currentContract.supplier }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 15px;">
            <el-col :span="8">
              <div class="info-item">
                <span class="label">开始日期：</span>
                <span class="value">{{ currentContract.startDate }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">结束日期：</span>
                <span class="value">{{ currentContract.endDate }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">执行进度：</span>
                <span class="value">{{ currentContract.progress }}%</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 进度信息 -->
        <div class="progress-section">
          <div class="section-title">执行进度</div>
          <el-steps :active="getProgressStep" align-center>
            <el-step title="合同签订" description="2024-01-01"></el-step>
            <el-step title="首付款支付" description="2024-01-15"></el-step>
            <el-step title="设备到货" description="2024-02-01"></el-step>
            <el-step title="验收完成" description="待完成"></el-step>
            <el-step title="结算完成" description="待完成"></el-step>
          </el-steps>
        </div>
      </el-card>

      <!-- 执行记录 -->
      <div class="execution-section">
        <div class="section-header">
          <div class="section-title">执行记录</div>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in executionRecords"
            :key="index"
            :timestamp="record.date"
            :type="record.type"
          >
            <div class="timeline-content">
              <h4>{{ record.title }}</h4>
              <p>{{ record.content }}</p>
              <div class="timeline-attachment" v-if="record.attachments && record.attachments.length">
                <div class="attachment-title">相关附件：</div>
                <div class="attachment-list">
                  <el-link
                    v-for="(file, fileIndex) in record.attachments"
                    :key="fileIndex"
                    type="primary"
                    :underline="false"
                    icon="el-icon-document"
                  >
                    {{ file.name }}
                  </el-link>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 付款记录 -->
      <div class="payment-section">
        <div class="section-header">
          <div class="section-title">付款记录</div>
        </div>
        <el-table :data="paymentRecords" style="width: 100%">
          <el-table-column prop="date" label="付款日期" width="120" />
          <el-table-column prop="phase" label="付款阶段" width="120" />
          <el-table-column prop="amount" label="付款金额" width="150">
            <template slot-scope="scope">
              ￥{{ scope.row.amount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="percentage" label="占比" width="100">
            <template slot-scope="scope">
              {{ scope.row.percentage }}%
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'info'" size="small">
                {{ scope.row.statusText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ContractManagement',
  data() {
    return {
      // 搜索表单
      searchForm: {
        keyword: '',
        type: '',
        status: '',
        dateRange: []
      },
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 进度对话框
      progressDialogVisible: false,
      currentContract: null,
      progressForm: {
        progress: 0,
        remark: '',
        date: new Date()
      },
      // 合同列表数据
      contractList: [
        {
          id: 1,
          contractNo: 'HT202401001',
          name: '2024年度计算机设备采购合同',
          type: 'purchase',
          typeText: '采购合同',
          supplier: '联想（北京）有限公司',
          amount: 580000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          progress: 35,
          status: 'active',
          statusText: '执行中'
        },
        {
          id: 2,
          contractNo: 'HT202401002',
          name: '校园网络设备维保服务合同',
          type: 'maintenance',
          typeText: '维保合同',
          supplier: '华为技术服务有限公司',
          amount: 200000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          progress: 25,
          status: 'active',
          statusText: '执行中'
        },
        {
          id: 3,
          contractNo: 'HT202401003',
          name: '打印机租赁及服务合同',
          type: 'lease',
          typeText: '租赁合同',
          supplier: '富士施乐（中国）有限公司',
          amount: 150000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          progress: 0,
          status: 'pending',
          statusText: '待审批'
        }
      ],
      // 添加新的数据属性
      detailDialogVisible: false,
      executionRecords: [
        {
          date: '2024-03-15',
          type: 'success',
          title: '完成首批设备验收',
          content: '完成20台ThinkPad笔记本电脑的到货验收工作，设备状态良好，性能符合要求。',
          attachments: [
            { name: '验收报告.pdf' },
            { name: '设备清单.xlsx' }
          ]
        },
        {
          date: '2024-02-01',
          type: 'primary',
          title: '设备到货',
          content: '第一批设备已送达指定地点，等待验收。',
          attachments: [
            { name: '送货单.pdf' }
          ]
        },
        {
          date: '2024-01-15',
          type: 'success',
          title: '支付首付款',
          content: '按合同约定支付30%首付款，金额：￥174,000',
          attachments: [
            { name: '付款凭证.pdf' }
          ]
        },
        {
          date: '2024-01-01',
          type: 'primary',
          title: '合同签订',
          content: '双方完成合同签订，合同正式生效。',
          attachments: [
            { name: '合同文本.pdf' },
            { name: '技术协议.pdf' }
          ]
        }
      ],
      paymentRecords: [
        {
          date: '2024-01-15',
          phase: '首付款',
          amount: 174000,
          percentage: 30,
          status: 'completed',
          statusText: '已完成',
          remark: '合同签订后支付'
        },
        {
          date: '2024-03-01',
          phase: '到货款',
          amount: 290000,
          percentage: 50,
          status: 'completed',
          statusText: '已完成',
          remark: '设备到货验收后支付'
        },
        {
          date: '2024-12-31',
          phase: '质保金',
          amount: 116000,
          percentage: 20,
          status: 'pending',
          statusText: '待支付',
          remark: '质保期满后支付'
        }
      ],
      // 添加 handleAdd 方法需要的数据
      handleAdd() {
        this.$message.info('新增合同功能开发中...')
      }
    }
  },
  computed: {
    // 获取当前进度步骤
    getProgressStep() {
      if (!this.currentContract) return 0
      return Math.ceil(this.currentContract.progress / 20) // 假设每个步骤占20%
    }
  },
  methods: {
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        keyword: '',
        type: '',
        status: '',
        dateRange: []
      }
    },
    // 获取合同类型标签样式
    getContractTypeTag(type) {
      const typeMap = {
        purchase: 'primary',
        lease: 'success',
        maintenance: 'warning',
        service: 'info'
      }
      return typeMap[type] || 'info'
    },
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        active: 'success',
        pending: 'warning',
        completed: 'info',
        terminated: 'danger'
      }
      return statusMap[status] || 'info'
    },
    // 获取进度状态
    getProgressStatus(row) {
      if (row.status === 'terminated') return 'exception'
      if (row.progress === 100) return 'success'
      return ''
    },
    // 获取进度文本
    getProgressText(row) {
      if (!row) return ''
      if (row.status === 'terminated') return '已终止'
      if (row.progress === 100) return '已完成'
      return `完成${row.progress}%`
    },
    // 处理分页
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 查看详情
    handleDetail(row) {
      this.currentContract = row
      this.detailDialogVisible = true
    },
    // 更新进度
    handleProgress(row) {
      this.currentContract = row
      this.progressForm.progress = row.progress
      this.progressDialogVisible = true
    },
    // 提交进度更新
    submitProgress() {
      if (this.currentContract) {
        this.currentContract.progress = this.progressForm.progress
        if (this.progressForm.progress === 100) {
          this.currentContract.status = 'completed'
          this.currentContract.statusText = '已完成'
        }
        this.$message.success('进度更新成功')
        this.progressDialogVisible = false
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
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.header-title h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: #409EFF;
  border-radius: 2px;
}

.header-tip {
  color: #909399;
  font-size: 14px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-container .el-card {
  border: none;
}

.filter-container .el-card__body {
  padding: 15px 20px;
}

.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 0;
}

.pagination-container {
  margin-top: 20px;
  padding: 20px;
  text-align: right;
}

.progress-form {
  padding: 0 20px;
}

.contract-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.contract-info p {
  margin: 5px 0;
  color: #606266;
}

.contract-info strong {
  color: #303133;
  margin-right: 5px;
}

.progress-info {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.el-table .cell {
  white-space: nowrap;
}

/* 自定义进度条颜色 */
.el-progress-bar__outer {
  background-color: #ebeef5;
}

.el-progress-bar__inner {
  transition: width 0.6s ease;
}

/* 表格内标签样式 */
.el-tag--mini {
  padding: 0 8px;
  height: 20px;
  line-height: 18px;
}

.detail-dialog .el-card {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.contract-code {
  font-size: 14px;
  color: #909399;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.label {
  font-weight: 600;
  color: #303133;
}

.value {
  color: #606266;
}

.value.amount {
  font-weight: 600;
}

.progress-section {
  margin-bottom: 20px;
}

.execution-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-content {
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
}

.timeline-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.timeline-content p {
  color: #606266;
}

.timeline-attachment {
  margin-top: 10px;
}

.attachment-title {
  font-weight: 600;
  color: #303133;
  margin-right: 5px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.payment-section {
  margin-bottom: 20px;
}

.payment-section .el-table {
  background-color: #fff;
}

.payment-section .el-table .el-table-column {
  padding: 10px;
}

.payment-section .el-table .el-table-column .label {
  font-weight: 600;
  color: #303133;
}

.payment-section .el-table .el-table-column .value {
  color: #606266;
}

.payment-section .el-table .el-table-column .value.amount {
  font-weight: 600;
}

.payment-section .el-table .el-table-column .status {
  text-align: center;
}

.payment-section .el-table .el-table-column .status .el-tag {
  padding: 0 8px;
  height: 20px;
  line-height: 18px;
}

.payment-section .el-table .el-table-column .remark {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 