<template>
  <div class="app-container">
    <!-- 页面标题和按钮组 -->
    <div class="page-header">
      <div class="header-title">
        <h2>库存管理</h2>
        <div class="header-tip">管理IT设备和配件的入库、出库及库存状态</div>
      </div>
      <div class="header-action">
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" @click="handleInStock">入库登记</el-button>
          <el-button type="warning" icon="el-icon-box" @click="handleOutStock">出库登记</el-button>
          <el-button type="info" icon="el-icon-document" @click="handleStockCheck">库存盘点</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <el-form :inline="true" :model="searchForm" size="small">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入资产名称/编号"
              clearable
              prefix-icon="el-icon-search"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.category" placeholder="资产类别" clearable style="width: 160px">
              <el-option label="计算机设备" value="computer">
                <i class="el-icon-monitor"></i> 计算机设备
              </el-option>
              <el-option label="网络设备" value="network">
                <i class="el-icon-connection"></i> 网络设备
              </el-option>
              <el-option label="外设配件" value="peripheral">
                <i class="el-icon-mouse"></i> 外设配件
              </el-option>
              <el-option label="办公设备" value="office">
                <i class="el-icon-printer"></i> 办公设备
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.status" placeholder="库存状态" clearable style="width: 160px">
              <el-option label="充足" value="sufficient">
                <el-tag size="small" type="success" effect="plain">充足</el-tag>
              </el-option>
              <el-option label="正常" value="normal">
                <el-tag size="small" type="info" effect="plain">正常</el-tag>
              </el-option>
              <el-option label="偏低" value="low">
                <el-tag size="small" type="warning" effect="plain">偏低</el-tag>
              </el-option>
              <el-option label="紧缺" value="shortage">
                <el-tag size="small" type="danger" effect="plain">紧缺</el-tag>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 库存预警提示 -->
    <el-alert
      v-if="lowStockItems.length > 0"
      title="库存预警"
      type="warning"
      :closable="false"
      show-icon
    >
      <div class="alert-content">
        以下物品库存偏低，请及时补充：
        <el-tag 
          v-for="item in lowStockItems" 
          :key="item.id"
          size="small" 
          type="warning" 
          class="alert-tag"
        >
          {{ item.name }}（剩余：{{ item.stock }}）
        </el-tag>
      </div>
    </el-alert>

    <!-- 库存列表 -->
    <el-table
      :data="stockList"
      style="width: 100%; margin-top: 20px;"
      border
      :header-cell-style="{ background: '#f5f7fa' }"
    >
      <el-table-column prop="code" label="资产编号" width="120" />
      <el-table-column prop="name" label="资产名称" min-width="150">
        <template slot-scope="scope">
          <div class="asset-name">
            <span>{{ scope.row.name }}</span>
            <el-tag 
              size="mini" 
              :type="scope.row.status === 'shortage' ? 'danger' : 
                     scope.row.status === 'low' ? 'warning' : 
                     scope.row.status === 'sufficient' ? 'success' : 'info'"
              class="status-tag"
            >
              {{ scope.row.statusText }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="类别" width="120" />
      <el-table-column prop="specification" label="规格型号" width="150" />
      <el-table-column prop="location" label="存放位置" width="120" />
      <el-table-column label="库存情况" width="200">
        <template slot-scope="scope">
          <el-progress 
            :percentage="getProgressPercentage(scope.row)"
            :type="'line'"
            :stroke-width="15"
          >
            <span>{{ scope.row.stock }}/{{ scope.row.maxStock }}</span>
          </el-progress>
          <div class="stock-info">
            <span>当前：{{ scope.row.stock }}</span>
            <el-divider direction="vertical" />
            <span>最低：{{ scope.row.minStock }}</span>
            <el-divider direction="vertical" />
            <span>最高：{{ scope.row.maxStock }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button 
            size="mini" 
            type="primary" 
            plain
            @click="handleStockDetail(scope.row)"
          >
            库存明细
          </el-button>
          <el-button 
            size="mini" 
            type="success" 
            plain
            @click="handleStockRecord(scope.row)"
          >
            出入记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 入库登记对话框 -->
    <el-dialog
      title="入库登记"
      :visible.sync="inStockDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="inStockForm" :rules="inStockRules" ref="inStockForm" label-width="100px">
        <el-form-item label="资产选择" prop="assetId">
          <el-select v-model="inStockForm.assetId" placeholder="请选择入库资产" style="width: 100%">
            <el-option
              v-for="item in stockList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                当前库存: {{ item.stock }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number 
            v-model="inStockForm.quantity" 
            :min="1" 
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="inStockForm.supplier" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="采购单号" prop="purchaseNo">
          <el-input v-model="inStockForm.purchaseNo" placeholder="请输入采购单号" />
        </el-form-item>
        <el-form-item label="存放位" prop="location">
          <el-input v-model="inStockForm.location" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input
            type="textarea"
            v-model="inStockForm.remark"
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="inStockDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitInStock('inStockForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 出库登记对话框 -->
    <el-dialog
      title="出库登记"
      :visible.sync="outStockDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="outStockForm" :rules="outStockRules" ref="outStockForm" label-width="100px">
        <el-form-item label="资产选择" prop="assetId">
          <el-select v-model="outStockForm.assetId" placeholder="请选择出库资产" style="width: 100%">
            <el-option
              v-for="item in stockList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                可用库存: {{ item.stock }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number 
            v-model="outStockForm.quantity" 
            :min="1"
            :max="getMaxOutStock()"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="领用部门" prop="department">
          <el-select v-model="outStockForm.department" placeholder="请选择领用部门" style="width: 100%">
            <el-option label="信息中心" value="信息中心" />
            <el-option label="教务处" value="教务处" />
            <el-option label="学生处" value="学生处" />
            <el-option label="图书馆" value="图书馆" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用人" prop="receiver">
          <el-input v-model="outStockForm.receiver" placeholder="请输入领用人姓名" />
        </el-form-item>
        <el-form-item label="用途说明" prop="purpose">
          <el-input
            type="textarea"
            v-model="outStockForm.purpose"
            :rows="3"
            placeholder="请输入用途说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="outStockDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitOutStock('outStockForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 库存明细对话框 -->
    <el-dialog 
      title="库存明细" 
      :visible.sync="detailDialogVisible"
      width="800px"
      :close-on-click-modal="false"
      custom-class="detail-dialog"
    >
      <!-- 资产基本信息卡片 -->
      <el-card class="detail-card" shadow="never">
        <div class="detail-header">
          <div class="header-left">
            <h3>{{ currentAsset.name }}</h3>
            <el-tag 
              size="small" 
              :type="currentAsset.status === 'shortage' ? 'danger' : 
                     currentAsset.status === 'low' ? 'warning' : 
                     currentAsset.status === 'sufficient' ? 'success' : 'info'"
            >
              {{ currentAsset.statusText }}
            </el-tag>
          </div>
          <div class="header-right">
            <span class="asset-code">编号：{{ currentAsset.code }}</span>
          </div>
        </div>
        
        <el-row :gutter="20" class="detail-info">
          <el-col :span="8">
            <div class="info-item">
              <span class="label">资产类别：</span>
              <span class="value">{{ currentAsset.category }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">规格型号：</span>
              <span class="value">{{ currentAsset.specification }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">存放位置：</span>
              <span class="value">{{ currentAsset.location }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="detail-stock">
          <el-col :span="8">
            <div class="stock-item">
              <div class="stock-label">当前库存</div>
              <div class="stock-value" :class="{ 'warning': currentAsset.stock <= currentAsset.minStock }">
                {{ currentAsset.stock }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stock-item">
              <div class="stock-label">最低库存</div>
              <div class="stock-value min">{{ currentAsset.minStock }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stock-item">
              <div class="stock-label">最高库存</div>
              <div class="stock-value max">{{ currentAsset.maxStock }}</div>
            </div>
          </el-col>
        </el-row>

        <el-progress 
          :percentage="getProgressPercentage(currentAsset)"
          :type="'line'"
          :stroke-width="15"
          class="stock-progress"
        >
          <span>{{ currentAsset.stock }}/{{ currentAsset.maxStock }}</span>
        </el-progress>
      </el-card>

      <!-- 库存变动记录 -->
      <div class="detail-section">
        <div class="section-header">
          <div class="section-title">库存变动记录</div>
          <div class="section-filter">
            <el-date-picker
              v-model="detailDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="width: 260px"
            />
          </div>
        </div>

        <el-table :data="stockRecords" style="width: 100%" :max-height="300">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="type" label="类型" width="100">
            <template slot-scope="scope">
              <el-tag 
                :type="scope.row.type === '入库' ? 'success' : 
                       scope.row.type === '出库' ? 'danger' : 'info'"
                size="mini"
              >
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template slot-scope="scope">
              <span :class="{ 'text-success': scope.row.type === '入库', 'text-danger': scope.row.type === '出库' }">
                {{ scope.row.type === '入库' ? '+' : '-' }}{{ scope.row.quantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>

        <!-- 变动统计 -->
        <div class="detail-statistics">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">入库总量</div>
                <div class="stat-value in">+{{ totalIn }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">出库总量</div>
                <div class="stat-value out">-{{ totalOut }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">净变化量</div>
                <div class="stat-value" :class="{ 'text-success': netChange >= 0, 'text-danger': netChange < 0 }">
                  {{ netChange >= 0 ? '+' : '' }}{{ netChange }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 库存盘点对话框 -->
    <el-dialog 
      title="库存盘点" 
      :visible.sync="checkDialogVisible"
      width="1000px"
      :close-on-click-modal="false"
      custom-class="check-dialog"
    >
      <!-- 盘点信息头部 -->
      <div class="check-header">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="label">盘点编号：</span>
              <span class="value">{{ checkForm.checkNo }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">盘点人：</span>
              <el-input v-model="checkForm.checker" size="small" style="width: 150px" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">盘点日期：</span>
              <span class="value">{{ checkForm.checkDate }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 盘点过滤器 -->
      <div class="check-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="checkForm.keyword"
              placeholder="搜索资产名称/编号"
              prefix-icon="el-icon-search"
              clearable
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="checkForm.category" placeholder="资产类别" clearable>
              <el-option label="计算机设备" value="computer" />
              <el-option label="网络设备" value="network" />
              <el-option label="外设配件" value="peripheral" />
              <el-option label="办公设备" value="office" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="checkForm.location" placeholder="存放位置" clearable>
              <el-option label="仓库A区" value="A" />
              <el-option label="仓库B区" value="B" />
              <el-option label="仓库C区" value="C" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="startCheck">开始盘点</el-button>
            <el-button type="success" @click="submitCheck">提交盘点</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 盘点表格 -->
      <el-table
        :data="checkList"
        style="width: 100%"
        :max-height="500"
        v-loading="checkLoading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="资产编号" width="120" />
        <el-table-column prop="name" label="资产名称" min-width="150" />
        <el-table-column prop="specification" label="规格型号" width="150" />
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column label="系统库存" width="100">
          <template slot-scope="scope">
            {{ scope.row.stock }}
          </template>
        </el-table-column>
        <el-table-column label="实际库存" width="150">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.actualStock"
              :min="0"
              controls-position="right"
              size="small"
              style="width: 120px"
            />
          </template>
        </el-table-column>
        <el-table-column label="差异" width="100">
          <template slot-scope="scope">
            <span :class="getDiffClass(scope.row)">
              {{ scope.row.actualStock - scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row)" size="small">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.remark"
              type="text"
              size="small"
              placeholder="请输入备注说明"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 盘点统计 -->
      <div class="check-summary">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="summary-item">
              <div class="summary-label">待盘点</div>
              <div class="summary-value">{{ getPendingCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item">
              <div class="summary-label">已盘点</div>
              <div class="summary-value">{{ getCheckedCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item">
              <div class="summary-label">有差异</div>
              <div class="summary-value warning">{{ getDiffCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item">
              <div class="summary-label">盘点进度</div>
              <div class="summary-value">
                <el-progress 
                  :percentage="getProgress"
                  :type="'line'"
                  :stroke-width="10"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StockManagement',
  data() {
    return {
      // 搜索表单
      searchForm: {
        keyword: '',
        category: '',
        status: ''
      },
      // 入库表单
      inStockDialogVisible: false,
      inStockForm: {
        assetId: '',
        quantity: 1,
        supplier: '',
        purchaseNo: '',
        location: '',
        remark: ''
      },
      inStockRules: {
        assetId: [{ required: true, message: '请选择入库资产', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
        supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
        location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }]
      },
      // 出库表单
      outStockDialogVisible: false,
      outStockForm: {
        assetId: '',
        quantity: 1,
        department: '',
        receiver: '',
        purpose: ''
      },
      outStockRules: {
        assetId: [{ required: true, message: '请选择出库资产', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
        department: [{ required: true, message: '请选择领用部门', trigger: 'change' }],
        receiver: [{ required: true, message: '请输入领用人', trigger: 'blur' }],
        purpose: [{ required: true, message: '请输入用途明', trigger: 'blur' }]
      },
      // 库存列表数据
      stockList: [
        {
          id: 1,
          code: 'PC202401001',
          name: 'ThinkPad E14',
          category: '计算机设备',
          specification: 'i5/16G/512G',
          location: '仓A-01-01',
          stock: 15,
          minStock: 5,
          maxStock: 30,
          status: 'normal',
          statusText: '正常'
        },
        {
          id: 2,
          code: 'NW202401001',
          name: 'Cisco交换机',
          category: '网络设备',
          specification: 'WS-C2960-24TC-L',
          location: '仓库B-02-01',
          stock: 3,
          minStock: 5,
          maxStock: 20,
          status: 'low',
          statusText: '偏低'
        },
        {
          id: 3,
          code: 'PR202401001',
          name: 'HP打印机',
          category: '办公设备',
          specification: 'LaserJet Pro M1136',
          location: '仓库A-03-02',
          stock: 9,
          minStock: 3,
          maxStock: 15,
          status: 'sufficient',
          statusText: '充足'
        }
      ],
      detailDialogVisible: false,
      currentAsset: {},
      detailDateRange: [],
      stockRecords: [
        {
          date: '2024-03-15',
          type: '入库',
          quantity: 10,
          operator: '张三',
          department: '信息中心',
          remark: '采购入库'
        },
        {
          date: '2024-03-14',
          type: '出库',
          quantity: 2,
          operator: '李四',
          department: '教务处',
          remark: '设备维护使用'
        },
        {
          date: '2024-03-12',
          type: '入库',
          quantity: 5,
          operator: '王五',
          department: '信息中心',
          remark: '退库入库'
        },
        {
          date: '2024-03-10',
          type: '出库',
          quantity: 3,
          operator: '赵六',
          department: '学生处',
          remark: '设备更换'
        }
      ],
      checkDialogVisible: false,
      checkLoading: false,
      checkForm: {
        checkNo: '',
        checker: '',
        checkDate: '',
        keyword: '',
        category: '',
        location: ''
      },
      checkList: [],
      // 添加盘点状态常量
      checkStatus: {
        PENDING: '待盘点',
        CHECKED: '已盘点',
        DIFFERENT: '有差异'
      }
    }
  },
  computed: {
    // 库存预警列表
    lowStockItems() {
      return this.stockList.filter(item => item.stock <= item.minStock)
    },
    // 计算入库总量
    totalIn() {
      return this.stockRecords
        .filter(record => record.type === '入库')
        .reduce((sum, record) => sum + record.quantity, 0)
    },
    // 计算出库总量
    totalOut() {
      return this.stockRecords
        .filter(record => record.type === '出库')
        .reduce((sum, record) => sum + record.quantity, 0)
    },
    // 计算净变化量
    netChange() {
      return this.totalIn - this.totalOut
    },
    // 获取待盘点数量
    getPendingCount() {
      return this.checkList.filter(item => 
        item.status === this.checkStatus.PENDING
      ).length
    },
    // 获取已盘点数量
    getCheckedCount() {
      return this.checkList.filter(item => 
        item.status !== this.checkStatus.PENDING
      ).length
    },
    // 获取差异数量
    getDiffCount() {
      return this.checkList.filter(item => 
        item.status === this.checkStatus.DIFFERENT
      ).length
    },
    // 获取盘点进度
    getProgress() {
      if (!this.checkList || this.checkList.length === 0) return 0
      const checkedCount = this.checkList.filter(item => 
        item.status !== this.checkStatus.PENDING
      ).length
      return Math.round((checkedCount / this.checkList.length) * 100)
    }
  },
  methods: {
    // 入库登记
    handleInStock() {
      this.inStockDialogVisible = true
      this.$nextTick(() => {
        this.$refs.inStockForm && this.$refs.inStockForm.resetFields()
      })
    },
    // 出库登记
    handleOutStock() {
      this.outStockDialogVisible = true
      this.$nextTick(() => {
        this.$refs.outStockForm && this.$refs.outStockForm.resetFields()
      })
    },
    // 库存盘点
    handleStockCheck() {
      this.initCheckForm()
      this.checkDialogVisible = true
    },
    // 初始化盘点表单
    initCheckForm() {
      // 生成盘点编号
      const now = new Date()
      const checkNo = 'PD' + now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0')
      
      // 初始化表单数据
      this.checkForm = {
        checkNo,
        checker: '',
        checkDate: now.toLocaleDateString(),
        keyword: '',
        category: '',
        location: ''
      }
      
      // 初始化盘点列表
      this.checkList = this.stockList.map(item => ({
        ...item,
        actualStock: null,
        status: this.checkStatus.PENDING,
        remark: ''
      }))
    },
    // 开始盘点
    startCheck() {
      if (!this.checkForm.checker) {
        this.$message.warning('请输入盘点人姓名')
        return
      }

      // 过滤显示的盘点列表
      let filteredList = [...this.checkList]
      
      // 按关键字搜索
      if (this.checkForm.keyword) {
        filteredList = filteredList.filter(item => 
          item.name.includes(this.checkForm.keyword) || 
          item.code.includes(this.checkForm.keyword)
        )
      }
      
      // 按类别筛选
      if (this.checkForm.category) {
        filteredList = filteredList.filter(item => 
          item.category === this.checkForm.category
        )
      }
      
      // 按位置筛选
      if (this.checkForm.location) {
        filteredList = filteredList.filter(item => 
          item.location.includes(this.checkForm.location)
        )
      }

      this.checkLoading = true
      setTimeout(() => {
        // 自动填充系统库存作为实际库存的初始值
        filteredList.forEach(item => {
          if (item.actualStock === null) {
            item.actualStock = item.stock
            item.status = this.checkStatus.CHECKED
          }
        })
        this.checkLoading = false
        this.$message.success('已自动填充系统库存，请核对实际库存')
      }, 500)
    },
    // 监听实际库存变化
    handleActualStockChange(row) {
      if (row.actualStock === null) {
        row.status = this.checkStatus.PENDING
      } else if (row.actualStock === row.stock) {
        row.status = this.checkStatus.CHECKED
      } else {
        row.status = this.checkStatus.DIFFERENT
      }
    },
    // 提交盘点
    submitCheck() {
      // 检查是否有未盘点的物品
      if (this.getPendingCount > 0) {
        this.$message.warning('还有未盘点的物品，请先完成盘点')
        return
      }

      // 生成盘点报告
      const report = {
        checkNo: this.checkForm.checkNo,
        checker: this.checkForm.checker,
        checkDate: this.checkForm.checkDate,
        totalCount: this.checkList.length,
        normalCount: this.checkList.filter(item => item.actualStock === item.stock).length,
        diffCount: this.checkList.filter(item => item.actualStock !== item.stock).length,
        details: this.checkList.map(item => ({
          code: item.code,
          name: item.name,
          systemStock: item.stock,
          actualStock: item.actualStock,
          difference: item.actualStock - item.stock,
          status: item.status,
          remark: item.remark
        }))
      }

      this.$confirm('确认提交盘点结果？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里应该调用API保存盘点结果
        console.log('盘点报告：', report)
        
        // 更新库存
        this.checkList.forEach(item => {
          const stock = this.stockList.find(s => s.id === item.id)
          if (stock) {
            stock.stock = item.actualStock
          }
        })
        
        this.$message.success('盘点结果已提交')
        this.checkDialogVisible = false
      }).catch(() => {})
    },
    // 导出盘点结果
    exportCheckResult() {
      this.$message.info('导出功能开发中...')
    },
    // 获取差异样式
    getDiffClass(row) {
      if (!row || row.actualStock === null) return ''
      const diff = row.actualStock - row.stock
      if (diff > 0) return 'text-success'
      if (diff < 0) return 'text-danger'
      return ''
    },
    // 获取状态类型
    getStatusType(row) {
      if (!row) return ''
      switch (row.status) {
        case this.checkStatus.PENDING:
          return 'info'
        case this.checkStatus.CHECKED:
          return 'success'
        case this.checkStatus.DIFFERENT:
          return 'warning'
        default:
          return ''
      }
    },
    // 获取状态文本
    getStatusText(row) {
      return row ? row.status : ''
    },
    // 添加重置搜索方法
    resetSearch() {
      this.searchForm = {
        keyword: '',
        category: '',
        status: ''
      }
    },
    // 添加获取进度条百分比方法
    getProgressPercentage(row) {
      if (!row || !row.stock || !row.maxStock) return 0
      const percentage = (row.stock / row.maxStock) * 100
      return Math.min(Math.round(percentage), 100)
    },
    // 添加获取最大出库数量方法
    getMaxOutStock() {
      if (!this.outStockForm.assetId) return 0
      const asset = this.stockList.find(item => item.id === this.outStockForm.assetId)
      return asset ? asset.stock : 0
    }
  }
}
</script>

<style scoped>
/* 页面标题样式优化 */
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

.header-action {
  display: flex;
  gap: 10px;
}

/* 搜索区域样式优化 */
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

.el-select-dropdown__item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-select-dropdown__item i {
  font-size: 16px;
}

/* 按钮组样式优化 */
.el-button-group .el-button {
  padding: 10px 20px;
  font-weight: 500;
}

.el-button-group .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-button-group .el-button + .el-button {
  margin-left: -1px;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  padding: 0 8px;
}

.el-tag--plain {
  background: transparent;
}

/* 搜索按钮样式 */
.el-button--primary {
  padding: 9px 20px;
}

.el-button [class*="el-icon-"] + span {
  margin-left: 5px;
}

/* 输入框样式优化 */
.el-input__inner:hover,
.el-select:hover .el-input__inner {
  border-color: #409EFF;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-action {
    width: 100%;
    justify-content: flex-end;
  }
}

@media screen and (max-width: 768px) {
  .el-form--inline {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .el-form--inline .el-form-item {
    margin-right: 0;
    width: 100%;
  }
  
  .el-input,
  .el-select {
    width: 100% !important;
  }
}

/* 页面标题样式 */
h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 25px;
  position: relative;
  padding-left: 15px;
}

h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #409EFF;
  border-radius: 2px;
}

/* 搜索区域样式优化 */
.filter-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.el-input__inner:hover,
.el-select:hover .el-input__inner {
  border-color: #409EFF;
}

.el-button-group {
  .el-button {
    padding: 10px 20px;
    font-weight: 500;
  }
  .el-button + .el-button {
    margin-left: -1px;
  }
}

/* 预警提示样式优化 */
.el-alert {
  margin-bottom: 20px;
  border-radius: 8px;
}

.alert-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px 0;
}

.alert-tag {
  border-radius: 4px;
  padding: 2px 8px;
  margin: 0 4px;
  background: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.2);
  color: #e6a23c;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  height: 50px;
}

.el-table td {
  padding: 12px 0;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafafa;
}

/* 资产名称列样式 */
.asset-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 库存进度条样式 */
.el-progress {
  margin-bottom: 8px;
}

.el-progress-bar__outer {
  border-radius: 4px;
}

.stock-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 操作按钮样式 */
.el-button--mini {
  padding: 7px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.el-button--mini + .el-button--mini {
  margin-left: 8px;
}

/* 对话框样式优化 */
.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  padding: 20px 25px;
  border-bottom: 1px solid #f0f2f5;
}

.el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.el-dialog__body {
  padding: 25px;
}

.el-dialog__footer {
  padding: 20px 25px;
  border-top: 1px solid #f0f2f5;
}

/* 表单样式优化 */
.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.el-input-number.is-controls-right .el-input__inner {
  padding-left: 15px;
  padding-right: 50px;
}

/* 悬停效果 */
.el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 库存状态标签样式 */
.el-tag--success {
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.el-tag--warning {
  background: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.2);
  color: #e6a23c;
}

.el-tag--danger {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
}

.el-tag--info {
  background: rgba(144, 147, 153, 0.1);
  border-color: rgba(144, 147, 153, 0.2);
  color: #909399;
}

/* 动画效果 */
.el-button,
.el-input__inner,
.el-select .el-input__inner,
.el-tag {
  transition: all 0.3s ease;
}

/* 响应式布局优化 */
@media screen and (max-width: 1400px) {
  .el-col-6 {
    width: 33.33%;
  }
}

@media screen and (max-width: 1200px) {
  .el-col-6 {
    width: 50%;
  }
}

@media screen and (max-width: 768px) {
  .el-col-6 {
    width: 100%;
  }
}
</style> 