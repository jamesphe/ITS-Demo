<template>
  <div class="app-container">
    <h2>耗材管理</h2>
    
    <!-- 搜索和操作按钮区 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入耗材名称"
        style="width: 200px;"
        class="filter-item"
      />
      <el-select v-model="categoryFilter" placeholder="耗材类别" style="width: 150px;" class="filter-item">
        <el-option label="打印耗材" value="printer" />
        <el-option label="网络配件" value="network" />
        <el-option label="接口转换器" value="adapter" />
        <el-option label="其他配件" value="others" />
      </el-select>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增耗材</el-button>
    </div>

    <!-- 耗材列表 -->
    <el-table :data="consumableList" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="耗材名称" />
      <el-table-column prop="category" label="类别" />
      <el-table-column prop="specification" label="规格型号" />
      <el-table-column prop="stock" label="当前库存" />
      <el-table-column prop="minStock" label="最低库存" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button size="mini" @click="handlePurchase(scope.row)">采购入库</el-button>
          <el-button size="mini" type="success" @click="handleUse(scope.row)">领用登记</el-button>
          <el-button size="mini" type="info" @click="handleRecord(scope.row)">使用记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 采购入库对话框 -->
    <el-dialog 
      title="采购入库" 
      :visible.sync="purchaseDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      custom-class="purchase-dialog"
    >
      <div class="purchase-info" v-if="currentRow">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">耗材名称：</span>
              <span class="value">{{ currentRow.name }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">规格型号：</span>
              <span class="value">{{ currentRow.specification }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">当前库存：</span>
              <span class="value">{{ currentRow.stock }} {{ currentRow.unit }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">最低库存：</span>
              <span class="value">{{ currentRow.minStock }} {{ currentRow.unit }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-form 
        :model="purchaseForm" 
        :rules="purchaseRules"
        ref="purchaseForm"
        label-width="100px"
        class="purchase-form"
      >
        <div class="form-section">
          <div class="section-title">入库信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购数量" prop="quantity">
                <el-input-number 
                  v-model="purchaseForm.quantity" 
                  :min="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="采购单价" prop="price">
                <el-input v-model="purchaseForm.price" type="number">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="供应商" prop="supplier">
                <el-input v-model="purchaseForm.supplier" placeholder="请输入供应商名称"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="采购日期" prop="date">
                <el-date-picker
                  v-model="purchaseForm.date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="采购备注">
            <el-input
              type="textarea"
              v-model="purchaseForm.remark"
              :rows="3"
              placeholder="请输入采购备注信息"
              resize="none"
            />
          </el-form-item>
        </div>

        <div class="purchase-summary">
          <div class="summary-item">
            <span class="label">采购总价：</span>
            <span class="value price">￥{{ (purchaseForm.quantity * purchaseForm.price).toFixed(2) }}</span>
          </div>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="purchaseDialogVisible = false" plain>取 消</el-button>
        <el-button type="primary" @click="submitPurchase('purchaseForm')">确认入库</el-button>
      </div>
    </el-dialog>

    <!-- 领用登记对话框 -->
    <el-dialog 
      title="领用登记" 
      :visible.sync="useDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      custom-class="use-dialog"
    >
      <!-- 耗材信息展示区 -->
      <div class="use-info" v-if="currentRow">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">耗材名称：</span>
              <span class="value">{{ currentRow.name }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">规格型号：</span>
              <span class="value">{{ currentRow.specification }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">当前库存：</span>
              <span class="value" :class="{ 'warning': currentRow.stock <= currentRow.minStock }">
                {{ currentRow.stock }} {{ currentRow.unit }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">最低库存：</span>
              <span class="value">{{ currentRow.minStock }} {{ currentRow.unit }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 领用表单 -->
      <el-form 
        :model="useForm" 
        :rules="useFormRules"
        ref="useForm"
        label-width="100px"
        class="use-form"
      >
        <div class="form-section">
          <div class="section-title">领用信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="领用数量" prop="quantity">
                <el-input-number 
                  v-model="useForm.quantity" 
                  :min="1"
                  :max="currentRow ? currentRow.stock : 1"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="领用人" prop="user">
                <el-input v-model="useForm.user" placeholder="请输入领用人姓名"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="使用部门" prop="department">
                <el-select v-model="useForm.department" placeholder="请选择使用部门" style="width: 100%">
                  <el-option label="信息中心" value="信息中心" />
                  <el-option label="教务处" value="教务处" />
                  <el-option label="学生处" value="学生处" />
                  <el-option label="图书馆" value="图书馆" />
                  <el-option label="其他部门" value="其他部门" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="领用日期" prop="date">
                <el-date-picker
                  v-model="useForm.date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="用途说明" prop="purpose">
            <el-input
              type="textarea"
              v-model="useForm.purpose"
              :rows="3"
              placeholder="请简要说明耗材用途"
              resize="none"
            />
          </el-form-item>
        </div>

        <!-- 库存预警提示 -->
        <div class="stock-warning" v-if="currentRow && currentRow.stock <= currentRow.minStock">
          <i class="el-icon-warning"></i>
          当前库存已达到最低警戒线，请及时补充库存
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="useDialogVisible = false" plain>取 消</el-button>
        <el-button type="primary" @click="submitUse('useForm')">确认领用</el-button>
      </div>
    </el-dialog>

    <!-- 新增耗材对话框 -->
    <el-dialog 
      title="新增耗材" 
      :visible.sync="addDialogVisible" 
      width="650px"
      :close-on-click-modal="false"
      custom-class="consumable-dialog"
    >
      <el-form 
        :model="addForm" 
        :rules="addFormRules" 
        ref="addForm" 
        label-width="120px"
        class="consumable-form"
      >
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="耗材名称" prop="name">
                <el-input v-model="addForm.name" placeholder="请输入耗材名称"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="耗材类别" prop="category">
                <el-select v-model="addForm.category" placeholder="请选择耗材类别" style="width: 100%">
                  <el-option label="打印耗材" value="打印耗材">
                    <i class="el-icon-printer"></i> 打印耗材
                  </el-option>
                  <el-option label="网络配件" value="网络配件">
                    <i class="el-icon-connection"></i> 网络配件
                  </el-option>
                  <el-option label="接口转换器" value="接口转换器">
                    <i class="el-icon-switch-button"></i> 接口转换器
                  </el-option>
                  <el-option label="其他配件" value="其他配件">
                    <i class="el-icon-more"></i> 其他配件
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="规格型号" prop="specification">
                <el-input v-model="addForm.specification" placeholder="请输入规格型号"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计量单位" prop="unit">
                <el-select v-model="addForm.unit" placeholder="请选择计量单位" style="width: 100%">
                  <el-option label="个" value="个" />
                  <el-option label="米" value="米" />
                  <el-option label="包" value="包" />
                  <el-option label="卷" value="卷" />
                  <el-option label="件" value="件" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <div class="section-title">库存信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="初始库存" prop="stock">
                <el-input-number 
                  v-model="addForm.stock" 
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最低库存" prop="minStock">
                <el-input-number 
                  v-model="addForm.minStock" 
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="stock-tip">
            <i class="el-icon-warning-outline"></i>
            ���库存低于最低库存数量时，系统将显示库存预警提示
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">其他信息</div>
          <el-form-item label="备注说明">
            <el-input 
              type="textarea" 
              v-model="addForm.remark" 
              :rows="3" 
              placeholder="请输入备注说明"
              resize="none"
            />
          </el-form-item>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" plain>取 消</el-button>
        <el-button type="primary" @click="submitAdd('addForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 使用记录对话框 -->
    <el-dialog 
      title="使用记录" 
      :visible.sync="recordDialogVisible"
      width="900px"
      :close-on-click-modal="false"
      custom-class="record-dialog"
    >
      <!-- 耗材基本信息 -->
      <div class="record-info" v-if="currentRow">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="耗材名称">{{ currentRow.name }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ currentRow.specification }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">
            <span :class="{ 'warning-text': currentRow.stock <= currentRow.minStock }">
              {{ currentRow.stock }} {{ currentRow.unit }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 记录类型切换 -->
      <div class="record-tabs">
        <el-tabs v-model="activeRecordTab">
          <el-tab-pane label="领用记录" name="use">
            <!-- 领用记录搜索 -->
            <div class="record-search">
              <el-form :inline="true" :model="recordSearchForm" size="small">
                <el-form-item label="领用人">
                  <el-input v-model="recordSearchForm.user" placeholder="请输入领用人" clearable></el-input>
                </el-form-item>
                <el-form-item label="使用部门">
                  <el-select v-model="recordSearchForm.department" placeholder="请选择部门" clearable>
                    <el-option label="信息中心" value="信息中心" />
                    <el-option label="教务处" value="教务处" />
                    <el-option label="学生处" value="学生处" />
                    <el-option label="图书馆" value="图书馆" />
                  </el-select>
                </el-form-item>
                <el-form-item label="领用日期">
                  <el-date-picker
                    v-model="recordSearchForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                  >
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </div>

            <!-- 领用记录表格 -->
            <el-table :data="useRecords" style="width: 100%" :max-height="400">
              <el-table-column prop="date" label="领用日期" width="120" />
              <el-table-column prop="user" label="领用人" width="100" />
              <el-table-column prop="department" label="使用部门" width="120" />
              <el-table-column prop="quantity" label="领用数量" width="100">
                <template slot-scope="scope">
                  {{ scope.row.quantity }} {{ currentRow.unit }}
                </template>
              </el-table-column>
              <el-table-column prop="purpose" label="用途说明" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === '已归还' ? 'success' : 'info'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="采购记录" name="purchase">
            <!-- 采购记录表格 -->
            <el-table :data="purchaseRecords" style="width: 100%" :max-height="400">
              <el-table-column prop="date" label="采购日期" width="120" />
              <el-table-column prop="quantity" label="采购数量" width="100">
                <template slot-scope="scope">
                  {{ scope.row.quantity }} {{ currentRow.unit }}
                </template>
              </el-table-column>
              <el-table-column prop="price" label="单价" width="100">
                <template slot-scope="scope">
                  ￥{{ scope.row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="total" label="总价" width="120">
                <template slot-scope="scope">
                  ￥{{ (scope.row.quantity * scope.row.price).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="supplier" label="供应商" />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 分页 -->
      <div class="record-pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecords"
        >
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ConsumableManagement',
  data() {
    return {
      currentRow: null,
      searchQuery: '',
      categoryFilter: '',
      purchaseDialogVisible: false,
      useDialogVisible: false,
      purchaseForm: {
        quantity: 1,
        price: '',
        supplier: '',
        date: new Date(),
        remark: ''
      },
      purchaseRules: {
        quantity: [
          { required: true, message: '请输入采购数量', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入采购单价', trigger: 'blur' }
        ],
        supplier: [
          { required: true, message: '请输入供应商', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '请选择采购日期', trigger: 'change' }
        ]
      },
      useForm: {
        quantity: 1,
        user: '',
        department: '',
        purpose: ''
      },
      // 示例数据
      consumableList: [
        {
          name: 'HP LaserJet 打印机墨盒',
          category: '打印耗材',
          specification: 'HP-CF280A',
          stock: 15,
          minStock: 5,
          unit: '个'
        },
        {
          name: '超五类网线',
          category: '网络配件',
          specification: 'CAT5e',
          stock: 200,
          minStock: 50,
          unit: '米'
        },
        {
          name: 'HDMI转VGA转换器',
          category: '接口转换器',
          specification: '1080P',
          stock: 8,
          minStock: 3,
          unit: '个'
        }
      ],
      addDialogVisible: false,
      addForm: {
        name: '',
        category: '',
        specification: '',
        unit: '',
        stock: 0,
        minStock: 0,
        remark: ''
      },
      addFormRules: {
        name: [
          { required: true, message: '请输入耗材名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择耗材类别', trigger: 'change' }
        ],
        specification: [
          { required: true, message: '请输入��格型号', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请选择量单位', trigger: 'change' }
        ],
        stock: [
          { required: true, message: '请输入初始库存', trigger: 'blur' }
        ],
        minStock: [
          { required: true, message: '请输入最低库存', trigger: 'blur' }
        ]
      },
      recordDialogVisible: false,
      activeRecordTab: 'use',
      recordSearchForm: {
        user: '',
        department: '',
        dateRange: []
      },
      useRecords: [
        {
          date: '2024-03-15',
          user: '张三',
          department: '信息中心',
          quantity: 2,
          purpose: '打印机日常维护更换墨盒',
          status: '已领用'
        },
        {
          date: '2024-03-14',
          user: '李四',
          department: '教务处',
          quantity: 1,
          purpose: '新打印机安装使用',
          status: '已领用'
        },
        {
          date: '2024-03-12',
          user: '王五',
          department: '学生处',
          quantity: 3,
          purpose: '打印机维修更换',
          status: '已领用'
        },
        {
          date: '2024-03-10',
          user: '赵六',
          department: '图书馆',
          quantity: 2,
          purpose: '打印机日常维护',
          status: '已领用'
        },
        {
          date: '2024-03-08',
          user: '孙七',
          department: '信息中心',
          quantity: 5,
          purpose: '批量更换打印机耗材',
          status: '已领用'
        }
      ],
      purchaseRecords: [
        {
          date: '2024-03-10',
          quantity: 10,
          price: 299.00,
          supplier: '惠普办公设备有限公司',
          remark: '批量采购补充库存'
        },
        {
          date: '2024-02-28',
          quantity: 5,
          price: 320.00,
          supplier: '科技办公用品商城',
          remark: '紧急补充库存'
        },
        {
          date: '2024-02-15',
          quantity: 15,
          price: 285.00,
          supplier: '惠普办公设备有限公司',
          remark: '季度常规采购'
        },
        {
          date: '2024-01-20',
          quantity: 8,
          price: 310.00,
          supplier: '办公耗材批发中心',
          remark: '新学期储备'
        },
        {
          date: '2024-01-05',
          quantity: 12,
          price: 295.00,
          supplier: '惠普办公设备有限公司',
          remark: '年度首批采购'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      totalRecords: 0
    }
  },
  methods: {
    handleAdd() {
      this.addDialogVisible = true
      this.$nextTick(() => {
        this.$refs.addForm && this.$refs.addForm.resetFields()
      })
    },
    handlePurchase(row) {
      this.currentRow = {...row}
      this.purchaseDialogVisible = true
      this.$nextTick(() => {
        this.$refs.purchaseForm && this.$refs.purchaseForm.resetFields()
      })
    },
    handleUse(row) {
      this.currentRow = {...row}
      this.useDialogVisible = true
      this.$nextTick(() => {
        this.useForm = {
          quantity: 1,
          user: '',
          department: '',
          purpose: ''
        }
      })
    },
    handleRecord(row) {
      this.currentRow = {...row}
      this.recordDialogVisible = true
      this.$nextTick(() => {
        this.recordSearchForm = {
          user: '',
          department: '',
          dateRange: []
        }
      })
    },
    submitPurchase(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 这里仅作演示，实际应该调用API
          this.currentRow.stock += this.purchaseForm.quantity
          this.$message.success('采购入库成功')
          this.purchaseDialogVisible = false
          // 重置表单
          this.$refs[formName].resetFields()
        } else {
          return false
        }
      })
    },
    submitUse() {
      // 这里仅作演示，实际应该调用API
      if (this.currentRow.stock >= this.useForm.quantity) {
        this.currentRow.stock -= this.useForm.quantity
        this.$message.success('领用登记成功')
        this.useDialogVisible = false
      } else {
        this.$message.error('库存不足')
      }
    },
    submitAdd(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 这里是演示数据，实际应该调用API
          const newConsumable = {
            name: this.addForm.name,
            category: this.addForm.category,
            specification: this.addForm.specification,
            stock: this.addForm.stock,
            minStock: this.addForm.minStock,
            unit: this.addForm.unit
          }
          
          this.consumableList.unshift(newConsumable)
          this.$message.success('新增耗材成功')
          this.addDialogVisible = false
        } else {
          return false
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchUseRecords()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchUseRecords()
    },
    fetchUseRecords() {
      // 模拟根据搜索条件筛选数据
      let filteredRecords = [...this.useRecords]
      
      // 按领用人筛选
      if (this.recordSearchForm.user) {
        filteredRecords = filteredRecords.filter(record => 
          record.user.includes(this.recordSearchForm.user)
        )
      }
      
      // 按部门筛选
      if (this.recordSearchForm.department) {
        filteredRecords = filteredRecords.filter(record => 
          record.department === this.recordSearchForm.department
        )
      }
      
      // 按日期范围筛选
      if (this.recordSearchForm.dateRange && this.recordSearchForm.dateRange.length === 2) {
        const startDate = this.recordSearchForm.dateRange[0]
        const endDate = this.recordSearchForm.dateRange[1]
        filteredRecords = filteredRecords.filter(record => 
          record.date >= startDate && record.date <= endDate
        )
      }
      
      // 更新总记录数
      this.totalRecords = filteredRecords.length
      
      // 模拟分页
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.useRecords = filteredRecords.slice(start, end)
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.consumable-dialog {
  border-radius: 8px;
}

.consumable-dialog .el-dialog__body {
  padding: 20px 30px;
}

.form-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f9fafc;
  border-radius: 8px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.stock-tip {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #ecf5ff;
  border-radius: 4px;
  color: #409EFF;
  font-size: 13px;
}

.stock-tip i {
  margin-right: 5px;
}

.consumable-form .el-form-item {
  margin-bottom: 18px;
}

.consumable-form .el-select .el-input {
  width: 100%;
}

.dialog-footer {
  text-align: right;
  padding-top: 10px;
}

/* 美化图标选项 */
.el-select-dropdown__item i {
  margin-right: 5px;
  width: 16px;
}

/* 输入框悬停效果 */
.el-input:hover .el-input__inner,
.el-textarea:hover .el-textarea__inner {
  border-color: #409EFF;
}

/* 表单项标签样式 */
.el-form-item__label {
  font-weight: 500;
}

.purchase-dialog .el-dialog__body {
  padding: 20px 30px;
}

.purchase-info {
  background: #f5f7fa;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.info-item {
  line-height: 32px;
}

.info-item .label {
  color: #606266;
  margin-right: 8px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.purchase-form .form-section {
  background: #f9fafc;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.purchase-summary {
  background: #fff;
  padding: 15px 20px;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
  margin-top: 20px;
}

.summary-item {
  text-align: right;
}

.summary-item .label {
  color: #606266;
  margin-right: 8px;
}

.summary-item .value.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
  padding-top: 10px;
}

.use-dialog .el-dialog__body {
  padding: 20px 30px;
}

.use-info {
  background: #f5f7fa;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.use-info .info-item {
  line-height: 32px;
}

.use-info .info-item .label {
  color: #606266;
  margin-right: 8px;
}

.use-info .info-item .value {
  color: #303133;
  font-weight: 500;
}

.use-form .form-section {
  background: #f9fafc;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.use-form .use-info {
  background: #f5f7fa;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.use-form .use-info .info-item {
  line-height: 32px;
}

.use-form .use-info .info-item .label {
  color: #606266;
  margin-right: 8px;
}

.use-form .use-info .info-item .value {
  color: #303133;
  font-weight: 500;
}

.use-form .use-info .info-item .value.warning {
  color: #f56c6c;
  font-weight: bold;
}

.use-form .use-info .info-item .value.warning i {
  margin-right: 5px;
}

.use-form .stock-warning {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
  margin-top: 20px;
}

.use-form .stock-warning i {
  margin-right: 5px;
}

.record-dialog .el-dialog__body {
  padding: 20px 30px;
}

.record-info {
  margin-bottom: 20px;
}

.record-info .el-descriptions {
  background: #f9fafc;
  border-radius: 8px;
  padding: 15px;
}

.record-info .el-descriptions__label {
  color: #606266;
  font-weight: 500;
  width: 100px;
}

.record-info .el-descriptions__content {
  color: #303133;
  font-weight: 500;
}

.warning-text {
  color: #f56c6c;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
}

.warning-text i {
  margin-right: 4px;
}

.record-search {
  background: #f9fafc;
  padding: 18px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.record-search .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.record-search .el-form-item__label {
  color: #606266;
  font-weight: 500;
}

.record-search .el-input,
.record-search .el-select,
.record-search .el-date-editor {
  width: 200px;
}

.record-tabs {
  margin: 0 -30px;
  padding: 0 30px;
}

.record-tabs .el-tabs__header {
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.record-tabs .el-tabs__item {
  font-size: 15px;
  height: 40px;
  line-height: 40px;
}

.record-tabs .el-tabs__item.is-active {
  font-weight: bold;
}

.record-tabs .el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.record-tabs .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  height: 45px;
}

.record-tabs .el-table td {
  padding: 12px 0;
}

.record-tabs .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafafa;
}

.record-tabs .el-tag {
  border-radius: 4px;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
}

.record-pagination {
  margin-top: 25px;
  padding-top: 20px;
  text-align: right;
  border-top: 1px solid #f0f2f5;
}

.record-pagination .el-pagination {
  padding: 0;
  font-weight: normal;
}

.record-pagination .el-pagination button {
  background-color: #f5f7fa;
}

.record-pagination .el-pagination .el-select .el-input {
  width: 110px;
}

.price-column {
  color: #f56c6c;
  font-family: Monaco, monospace;
}

.el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

.el-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-dialog .el-dialog__body {
  overflow-y: auto;
  max-height: calc(90vh - 150px);
}

.record-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6px;
}

.record-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.record-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style> 