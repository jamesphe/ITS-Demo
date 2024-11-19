<template>
  <div class="app-container">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2 class="page-title">资产登记及入库</h2>
      <div class="page-desc">管理资产的登记入库、分发和回收流程</div>
    </div>
    
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="资产编号">
          <el-input v-model="searchForm.assetNo" placeholder="请输入资产编号" clearable>
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="资产类型">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="计算机设备" value="computer"></el-option>
            <el-option label="网络设备" value="network"></el-option>
            <el-option label="外设设备" value="peripheral"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="operation-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">登记入库</el-button>
      <el-button type="success" icon="el-icon-upload2" @click="handleBatchImport">批量导入</el-button>
    </div>

    <!-- 数据表格卡片 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        highlight-current-row>
        <el-table-column prop="assetNo" label="资产编号" width="120"></el-table-column>
        <el-table-column prop="name" label="资产名称" width="150"></el-table-column>
        <el-table-column prop="category" label="资产类型" width="120"></el-table-column>
        <el-table-column prop="specs" label="规格型号" width="150"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150"></el-table-column>
        <el-table-column prop="purchaseDate" label="采购日期" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '已入库' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="150"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleCheckin(scope.row)">入库</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 登记入库对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="650px"
      :close-on-click-modal="false"
      custom-class="custom-dialog asset-dialog"
      @close="handleDialogClose">
      <div class="dialog-content">
        <!-- 左侧表单 -->
        <el-form 
          :model="form" 
          :rules="rules"
          ref="assetForm"
          label-width="100px" 
          class="dialog-form"
          :status-icon="true">
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <div class="form-grid">
              <el-form-item label="资产编号" prop="assetNo">
                <el-input v-model="form.assetNo" placeholder="请输入资产编号">
                  <template slot="prepend">IT-</template>
                </el-input>
              </el-form-item>
              <el-form-item label="资产名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入资产名称"></el-input>
              </el-form-item>
              <el-form-item label="资产类型" prop="category">
                <el-select v-model="form.category" placeholder="请选择资产类型" class="full-width">
                  <el-option label="计算机设备" value="computer">
                    <i class="el-icon-monitor"></i> 计算机设备
                  </el-option>
                  <el-option label="网络设备" value="network">
                    <i class="el-icon-connection"></i> 网络设备
                  </el-option>
                  <el-option label="外设设备" value="peripheral">
                    <i class="el-icon-printer"></i> 外设设备
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="规格型号" prop="specs">
                <el-input v-model="form.specs" placeholder="请输入规格型号"></el-input>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">采购信息</div>
            <div class="form-grid">
              <el-form-item label="供应商" prop="supplier">
                <el-select v-model="form.supplier" placeholder="请选择供应商" class="full-width">
                  <el-option label="联想授权代理商" value="lenovo">
                    <span style="float: left">联想授权代理商</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">推荐</span>
                  </el-option>
                  <el-option label="戴尔授权代理商" value="dell"></el-option>
                  <el-option label="华为授权代理商" value="huawei"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="采购日期" prop="purchaseDate">
                <el-date-picker
                  v-model="form.purchaseDate"
                  type="date"
                  placeholder="选择日期"
                  class="full-width"
                  value-format="yyyy-MM-dd">
                </el-date-picker>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">存放信息</div>
            <div class="form-grid">
              <el-form-item label="存放位置" prop="location">
                <el-cascader
                  v-model="form.location"
                  :options="locationOptions"
                  placeholder="请选择存放位置"
                  class="full-width">
                </el-cascader>
              </el-form-item>
              <el-form-item label="管理员" prop="manager">
                <el-select v-model="form.manager" placeholder="请选择管理员" class="full-width">
                  <el-option
                    v-for="item in managerOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    <span style="float: left">{{ item.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.department }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>

          <el-form-item label="备注" prop="remarks">
            <el-input
              type="textarea"
              v-model="form.remarks"
              :rows="3"
              placeholder="请输入备注信息">
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel" icon="el-icon-close" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitForm" icon="el-icon-check" size="medium" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetCheckin',
  data() {
    return {
      searchForm: {
        assetNo: '',
        category: ''
      },
      tableData: [
        {
          assetNo: 'PC202401001',
          name: 'ThinkPad笔记本',
          category: '计算机设备',
          specs: 'T14 Gen2',
          supplier: '联想授权代理商',
          purchaseDate: '2024-01-15',
          status: '待入库',
          location: '信息楼仓库'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 100,
      dialogVisible: false,
      dialogTitle: '登记入库',
      form: {
        assetNo: '',
        name: '',
        category: '',
        specs: '',
        supplier: '',
        purchaseDate: '',
        location: '',
        remarks: ''
      },
      submitLoading: false,
      rules: {
        assetNo: [
          { required: true, message: '请输入资产编号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入资产名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择资产类型', trigger: 'change' }
        ],
        supplier: [
          { required: true, message: '请选择供应商', trigger: 'change' }
        ],
        purchaseDate: [
          { required: true, message: '请选择采购日期', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请选择存放位置', trigger: 'change' }
        ]
      },
      locationOptions: [{
        value: 'building1',
        label: '信息楼',
        children: [{
          value: 'floor1',
          label: '1楼',
          children: [{
            value: 'room101',
            label: '101机房'
          }, {
            value: 'room102',
            label: '102仓库'
          }]
        }]
      }],
      managerOptions: [{
        value: '1',
        label: '张三',
        department: 'IT部'
      }, {
        value: '2',
        label: '李四',
        department: '运维组'
      }]
    }
  },
  methods: {
    handleSearch() {
      // 模拟搜索功能
      this.$message.success('搜索成功')
    },
    resetSearch() {
      this.searchForm = {
        assetNo: '',
        category: ''
      }
    },
    handleAdd() {
      this.dialogTitle = '登记入库'
      this.dialogVisible = true
      this.form = {
        assetNo: '',
        name: '',
        category: '',
        specs: '',
        supplier: '',
        purchaseDate: '',
        location: '',
        remarks: ''
      }
    },
    handleBatchImport() {
      this.$message.info('批量导入功能开发中...')
    },
    handleEdit(row) {
      this.dialogTitle = '编辑资产'
      this.dialogVisible = true
      this.form = { ...row }
    },
    handleCheckin(row) {
      this.$confirm('确认将该资产入库吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('入库成功')
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确认删除该记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleDialogClose() {
      this.$refs.assetForm.resetFields()
    },
    handleCancel() {
      this.$confirm('确认关闭？未保存的数据将会丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogVisible = false
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.assetForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            this.$message.success('保存成功')
            this.submitLoading = false
            this.dialogVisible = false
          }, 1000)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #1f2f3d;
  }
  
  .page-desc {
    margin-top: 8px;
    color: #909399;
    font-size: 14px;
  }
}

.search-card {
  margin-bottom: 20px;
  
  .el-card__body {
    padding: 20px 20px 0;
  }
  
  .search-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}

.operation-container {
  margin-bottom: 20px;
  
  .el-button {
    margin-right: 12px;
    padding: 9px 16px;
  }
}

.table-card {
  .el-card__body {
    padding: 0;
  }
  
  .el-table {
    margin: 0;
    
    th {
      font-weight: 500;
    }
    
    .el-button--mini {
      padding: 6px 10px;
    }
  }
}

.pagination-container {
  padding: 15px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #e6ebf5;
}

.custom-dialog {
  .dialog-content {
    padding: 0 20px;
  }

  .form-section {
    margin-bottom: 25px;
    
    .section-title {
      font-size: 15px;
      font-weight: 500;
      color: #1f2f3d;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 3px solid #409EFF;
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .full-width {
    width: 100%;
  }

  .el-select-dropdown__item {
    padding: 0 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-input-group__prepend) {
    background-color: #f5f7fa;
    color: #909399;
    border-right: none;
  }

  :deep(.el-textarea__inner) {
    font-family: inherit;
  }

  :deep(.el-cascader) {
    width: 100%;
  }
}

.dialog-footer {
  text-align: right;
  padding: 15px 40px;
  border-top: 1px solid #e6ebf5;
  
  .el-button {
    padding: 9px 20px;
    font-size: 14px;
  }
}

// 自定义Element UI组件样式
:deep(.el-card) {
  border-radius: 4px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

:deep(.el-button) {
  &:hover {
    opacity: 0.8;
  }
}

:deep(.el-tag) {
  border-radius: 2px;
}

:deep(.el-table) {
  td {
    padding: 12px 0;
  }
}

:deep(.el-dialog) {
  border-radius: 4px;
  
  .el-dialog__header {
    padding: 20px 40px;
    border-bottom: 1px solid #e6ebf5;
  }
  
  .el-dialog__body {
    padding: 0;
  }
}
</style> 