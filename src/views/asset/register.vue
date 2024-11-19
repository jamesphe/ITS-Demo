<template>
  <div class="app-container">
    <div class="page-header">
      <h2>资产实物登记与管理</h2>
      <div class="header-desc">对IT设备资产进行实物登记和管理，包括详细配置信息</div>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="资产编号">
          <el-input 
            v-model="searchForm.assetNo" 
            placeholder="请输入资产编号"
            clearable
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="资产名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入资产名称"
            clearable
          >
            <i slot="prefix" class="el-icon-document"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="资产类型">
          <el-select 
            v-model="searchForm.type" 
            placeholder="请选择"
            clearable
          >
            <el-option label="计算机设备" value="computer" />
            <el-option label="网络设备" value="network" />
            <el-option label="外设设备" value="peripheral" />
            <el-option label="软件资产" value="software" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="operation-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增资产</el-button>
      <el-button type="success" icon="el-icon-upload2" @click="handleImport">批量导入</el-button>
      <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>

    <!-- 列表区域 -->
    <el-card shadow="hover" class="table-card">
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa' }"
        @row-click="handleRowClick"
      >
        <el-table-column prop="assetNo" label="资产编号" width="120" />
        <el-table-column prop="name" label="资产名称" width="150" />
        <el-table-column prop="type" label="资产类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="model" label="型号" width="120" />
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip />
        <el-table-column prop="serialNo" label="序列号" width="150" />
        <el-table-column prop="status" label="使用状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              icon="el-icon-edit"
              @click.stop="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
              icon="el-icon-delete"
              @click.stop="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="750px"
      :destroy-on-close="true"
      custom-class="asset-dialog"
    >
      <el-form 
        :model="form" 
        :rules="rules"
        ref="assetForm"
        label-width="100px"
        class="asset-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="资产编号" prop="assetNo">
                <el-input 
                  v-model="form.assetNo" 
                  placeholder="请输入资产编号"
                  :disabled="dialogTitle === '编辑资产'"
                >
                  <template slot="prepend">IT</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资产名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入资产名称" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="资产类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择" class="w-full">
                  <el-option label="计算机设备" value="computer">
                    <i class="el-icon-monitor"></i>
                    <span style="margin-left: 8px">计算机设备</span>
                  </el-option>
                  <el-option label="网络设备" value="network">
                    <i class="el-icon-connection"></i>
                    <span style="margin-left: 8px">网络设备</span>
                  </el-option>
                  <el-option label="外设设备" value="peripheral">
                    <i class="el-icon-printer"></i>
                    <span style="margin-left: 8px">外设设备</span>
                  </el-option>
                  <el-option label="软件资产" value="software">
                    <i class="el-icon-coin"></i>
                    <span style="margin-left: 8px">软件资产</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择" class="w-full">
                  <el-option label="在库" value="inStock">
                    <el-tag size="small" type="success">在库</el-tag>
                  </el-option>
                  <el-option label="使用中" value="inUse">
                    <el-tag size="small" type="primary">使用中</el-tag>
                  </el-option>
                  <el-option label="维修中" value="maintaining">
                    <el-tag size="small" type="warning">维修中</el-tag>
                  </el-option>
                  <el-option label="报废" value="scrapped">
                    <el-tag size="small" type="danger">报废</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 配置信息 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-setting"></i>
            <span>配置信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品牌" prop="brand">
                <el-input v-model="form.brand" placeholder="请输入品牌" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="型号" prop="model">
                <el-input v-model="form.model" placeholder="请输入型号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="规格" prop="specs">
            <el-input v-model="form.specs" type="textarea" :rows="2" placeholder="请输入规格信息" />
          </el-form-item>

          <el-form-item label="详细配置" prop="configuration">
            <el-input
              type="textarea"
              v-model="form.configuration"
              :rows="3"
              placeholder="请输入详细配置信息，如：CPU、内存、硬盘等"
            />
          </el-form-item>
        </div>

        <!-- 其他信息 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-more"></i>
            <span>其他信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="序列号" prop="serialNo">
                <el-input v-model="form.serialNo" placeholder="请输入序列号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="存放位置" prop="location">
                <el-input v-model="form.location" placeholder="请输入存放位置" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm('assetForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetRegister',
  data() {
    return {
      // 搜索表单
      searchForm: {
        assetNo: '',
        name: '',
        type: ''
      },
      // 表格数据
      tableData: [
        {
          assetNo: 'PC202401001',
          name: 'ThinkPad笔记本',
          type: '计算机设备',
          brand: 'Lenovo',
          model: 'T490',
          specs: 'i7-10代/16G/512G SSD',
          serialNo: 'LNV789456123',
          status: '在库',
          location: '信息楼-设备库房'
        }
      ],
      // 分页
      total: 100,
      pageSize: 10,
      // 弹窗
      dialogVisible: false,
      dialogTitle: '新增资产',
      // 表单
      form: {
        assetNo: '',
        name: '',
        type: '',
        brand: '',
        model: '',
        specs: '',
        serialNo: '',
        status: '',
        location: '',
        configuration: ''
      }
    }
  },
  methods: {
    handleSearch() {
      console.log('搜索条件：', this.searchForm)
    },
    resetSearch() {
      this.searchForm = {
        assetNo: '',
        name: '',
        type: ''
      }
    },
    handleAdd() {
      this.dialogTitle = '新增资产'
      this.form = {
        assetNo: '',
        name: '',
        type: '',
        brand: '',
        model: '',
        specs: '',
        serialNo: '',
        status: '',
        location: '',
        configuration: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑资产'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该资产记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      })
    },
    handleImport() {
      this.$message.info('批量导入功能开发中...')
    },
    handleExport() {
      this.$message.info('导出功能开发中...')
    },
    handleSubmit() {
      this.$message.success(this.dialogTitle + '成功')
      this.dialogVisible = false
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      console.log('当前页：', val)
    },
    getTypeTagType(type) {
      const typeMap = {
        '计算机设备': 'primary',
        '网络设备': 'success',
        '外设设备': 'warning',
        '软件资产': 'info'
      }
      return typeMap[type] || 'info'
    },
    getStatusTagType(status) {
      const statusMap = {
        '在库': 'success',
        '使用中': 'primary',
        '维修中': 'warning',
        '报废': 'danger'
      }
      return statusMap[status] || 'info'
    },
    handleRowClick(row) {
      console.log('点击行：', row)
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-desc {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.search-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.search-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.operation-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.asset-form {
  padding: 20px 0;
}

.w-full {
  width: 100%;
}

.el-tag {
  border-radius: 4px;
}

.el-table {
  border-radius: 4px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa !important;
  font-weight: 600;
}

.el-form-item__label {
  font-weight: 500;
}

.el-dialog__body {
  padding: 10px 20px;
}

.search-buttons {
  margin-left: auto;
}
</style> 