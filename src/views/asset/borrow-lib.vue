<template>
  <div class="app-container">
    <h2>借用资产库</h2>
    
    <!-- 搜索栏 -->
    <el-card class="filter-container">
      <div class="filter-top">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="设备名称">
              <el-input v-model="queryParams.name" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select v-model="queryParams.type" placeholder="请选择设备类型">
                <el-option label="笔记本电脑" value="laptop" />
                <el-option label="台式电脑" value="desktop" />
                <el-option label="投影仪" value="projector" />
                <el-option label="打印机" value="printer" />
                <el-option label="其他设备" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" @click="handleAdd">新增设备</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </div>
      </div>
    </el-card>

    <!-- 设备列表 -->
    <el-table
      v-loading="loading"
      :data="deviceList"
      @selection-change="handleSelectionChange"
      border
      stripe
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column label="设备编号" prop="code" width="120" align="center" />
      <el-table-column label="设备名称" prop="name" min-width="180" show-overflow-tooltip />
      <el-table-column label="设备类型" prop="type" width="120" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getDeviceTypeTag(row.type)"
            effect="plain"
            size="small"
          >
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可借用状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="row.status === '可借用' ? 'success' : 'danger'"
            effect="dark"
            size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可借用对象" prop="borrower" min-width="200">
        <template #default="{ row }">
          <el-tag 
            v-for="user in row.borrower" 
            :key="user" 
            type="info"
            effect="plain"
            size="small"
            style="margin: 2px 4px"
          >
            {{ user }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="text" 
            size="small" 
            @click="handleEdit(row)"
            icon="el-icon-edit"
          >
            编辑
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            class="delete-btn"
            @click="handleDelete(row)"
            icon="el-icon-delete"
          >
            删除
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            @click="handleSetBorrower(row)"
            icon="el-icon-user"
          >
            设置对象
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination-container"
      :current-page="queryParams.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="queryParams.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加/编辑设备对话框 -->
    <el-dialog 
      :title="dialog.title" 
      :visible.sync="dialog.visible" 
      width="750px"
      custom-class="device-dialog"
    >
      <el-form ref="deviceForm" :model="deviceForm" :rules="rules" label-width="120px">
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <div class="form-grid">
            <el-form-item label="设备编号" prop="code">
              <el-input v-model="deviceForm.code" placeholder="请输入设备编号" />
            </el-form-item>
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="设备类型" prop="type">
              <el-select v-model="deviceForm.type" placeholder="请选择设备类型" class="full-width">
                <el-option label="笔记本电脑" value="laptop" />
                <el-option label="台式电脑" value="desktop" />
                <el-option label="投影仪" value="projector" />
                <el-option label="打印机" value="printer" />
                <el-option label="其他设备" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="品牌型号" prop="model">
              <el-input v-model="deviceForm.model" placeholder="请输入品牌型号" />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">详细信息</div>
          <div class="form-grid">
            <el-form-item label="购入日期" prop="purchaseDate" class="date-item">
              <el-date-picker
                v-model="deviceForm.purchaseDate"
                type="date"
                placeholder="选择购入日期"
                value-format="YYYY-MM-DD"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="保修期限" prop="warranty">
              <div class="warranty-input">
                <el-input-number 
                  v-model="deviceForm.warranty" 
                  :min="0" 
                  :max="60"
                  controls-position="right"
                />
                <span class="unit-text">个月</span>
              </div>
            </el-form-item>
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="deviceForm.location" placeholder="请输入存放位置" />
            </el-form-item>
            <el-form-item label="可借用状态" prop="status">
              <el-radio-group v-model="deviceForm.status">
                <el-radio label="可借用">
                  <i class="el-icon-check status-icon"></i>可借用
                </el-radio>
                <el-radio label="不可借用">
                  <i class="el-icon-close status-icon"></i>不可借用
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">其他信息</div>
          <el-form-item label="设备规格" prop="specification">
            <el-input
              v-model="deviceForm.specification"
              type="textarea"
              :rows="3"
              placeholder="请输入设备规格，如：处理器、内存、硬盘等配置信息"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="deviceForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置可借用对象对话框 -->
    <el-dialog 
      title="设置可借用对象" 
      :visible.sync="borrowerDialog.visible" 
      width="500px"
    >
      <el-form :model="borrowerForm">
        <el-form-item label="可借用对象">
          <el-checkbox-group v-model="borrowerForm.users">
            <el-checkbox label="教师">教师</el-checkbox>
            <el-checkbox label="学生">学生</el-checkbox>
            <el-checkbox label="行政人员">行政人员</el-checkbox>
            <el-checkbox label="实验室人员">实验室人员</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowerDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitBorrowerForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BorrowLib',
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: ''
      },
      // 加载状态
      loading: false,
      // 设备列表数据
      deviceList: [
        {
          code: 'NB001',
          name: 'ThinkPad X1',
          type: '笔记本电脑',
          status: '可借用',
          borrower: ['教师', '行政人员']
        },
        {
          code: 'PR001',
          name: 'HP LaserJet Pro',
          type: '打印机',
          status: '可借用',
          borrower: ['教师', '学生', '行政人员']
        }
      ],
      // 总数
      total: 2,
      // 选中的行
      selectedRows: [],
      // 对话框状态
      dialog: {
        title: '',
        visible: false
      },
      // 设备表单
      deviceForm: {
        code: '',
        name: '',
        type: '',
        model: '',
        specification: '',
        purchaseDate: '',
        warranty: 12,
        location: '',
        status: '可借用',
        remarks: '',
        borrower: []
      },
      // 表单校验规则
      rules: {
        code: [
          { required: true, message: '请输入设备编号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        model: [
          { required: true, message: '请输入品牌型号', trigger: 'blur' }
        ],
        purchaseDate: [
          { required: true, message: '请选择购入日期', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入存放位置', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择可借用状态', trigger: 'change' }
        ]
      },
      // 可借用对象对话框
      borrowerDialog: {
        visible: false
      },
      // 可借用对象表单
      borrowerForm: {
        users: []
      }
    }
  },
  methods: {
    // 搜索
    handleSearch() {
      this.queryParams.pageNum = 1
      // 模拟搜索
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    // 重置查询
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: ''
      }
      this.handleSearch()
    },
    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 新增设备
    handleAdd() {
      this.dialog.title = '新增设备'
      this.deviceForm = {
        code: this.generateDeviceCode(),
        name: '',
        type: '',
        model: '',
        specification: '',
        purchaseDate: '',
        warranty: 12,
        location: '',
        status: '可借用',
        remarks: '',
        borrower: []
      }
      this.dialog.visible = true
    },
    // 编辑设备
    handleEdit(row) {
      this.dialog.title = '编辑设备'
      this.deviceForm = { ...row }
      this.dialog.visible = true
    },
    // 删除设备
    handleDelete(row) {
      this.$confirm('确认删除该设备吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      })
    },
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的设备')
        return
      }
      this.$confirm(`确认删除选中的 ${this.selectedRows.length} 个设备吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('批量删除成功')
      })
    },
    // 设置可借用对象
    handleSetBorrower(row) {
      this.borrowerForm.users = [...row.borrower]
      this.borrowerDialog.visible = true
    },
    // 提交设备表单
    submitForm() {
      this.$refs.deviceForm.validate(valid => {
        if (valid) {
          // 模拟提交数据
          this.loading = true
          setTimeout(() => {
            // 如果是新增，将表单数据添加到列表
            if (this.dialog.title === '新增设备') {
              this.deviceList.unshift({
                ...this.deviceForm,
                borrower: [] // 新设备默认没有可借用对象
              })
              this.total += 1
            } else {
              // 如果是编辑，更新列表中的数据
              const index = this.deviceList.findIndex(item => item.code === this.deviceForm.code)
              if (index !== -1) {
                this.deviceList[index] = { ...this.deviceForm }
              }
            }
            this.loading = false
            this.dialog.visible = false
            this.$message.success(this.dialog.title + '成功')
          }, 500)
        }
      })
    },
    // 提交可借用对象表单
    submitBorrowerForm() {
      this.$message.success('设置成功')
      this.borrowerDialog.visible = false
    },
    // 分页大小变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.handleSearch()
    },
    // 页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.handleSearch()
    },
    // 生成设备编号
    generateDeviceCode() {
      const prefix = {
        laptop: 'NB',
        desktop: 'PC',
        projector: 'PJ',
        printer: 'PR',
        other: 'OT'
      }
      const timestamp = Date.now().toString().slice(-6)
      return `${prefix.other}${timestamp}`
    },
    // 获取设备类型对应的Tag类型
    getDeviceTypeTag(type) {
      const typeMap = {
        '笔记本电脑': 'primary',
        '台式电脑': 'success',
        '投影仪': 'warning',
        '打印机': 'info',
        '其他设备': ''
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
/* 页面整体样式 */
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

h2 {
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
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

/* 搜索栏样式 */
.filter-container {
  margin-bottom: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: none;
}

.filter-container :deep(.el-card__body) {
  padding: 20px 25px;
}

.filter-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.filter-form {
  flex: 1;
}

.filter-form :deep(.el-form) {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-form :deep(.el-form-item:last-child) {
  margin-right: 0;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  margin-left: 16px;
  white-space: nowrap;
}

.filter-form :deep(.el-input),
.filter-form :deep(.el-select) {
  width: 200px;
}

/* 响应式布局调整 */
@media screen and (max-width: 1200px) {
  .filter-top {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-form :deep(.el-form) {
    flex-wrap: wrap;
  }
  
  .filter-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .filter-buttons {
    margin-left: 0;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

@media screen and (max-width: 768px) {
  .filter-form :deep(.el-input),
  .filter-form :deep(.el-select) {
    width: 100%;
  }
  
  .filter-buttons {
    flex-direction: column;
  }
  
  .filter-buttons .el-button {
    width: 100%;
  }
}

/* 按钮样式优化 */
.action-container {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

:deep(.el-button) {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-button--primary) {
  background: #409EFF;
  border-color: #409EFF;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

:deep(.el-button--primary:hover) {
  background: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

:deep(.el-button--danger) {
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
}

:deep(.el-button--danger:hover) {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
  transform: translateY(-1px);
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

:deep(.el-table::before) {
  display: none;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  height: 50px;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 操作按钮样式 */
:deep(.el-button--text) {
  padding: 0 8px;
  font-size: 13px;
  vertical-align: middle;
}

:deep(.el-button--text:hover) {
  color: #409EFF;
  background: #ecf5ff;
  border-radius: 4px;
}

:deep(.delete-btn:hover) {
  color: #f56c6c !important;
  background: #fef0f0;
}

:deep(.el-button [class*="el-icon-"] + span) {
  margin-left: 4px;
}

/* Tag样式优化 */
:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 8px;
  margin: 0 2px;
}

:deep(.el-tag--small) {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

:deep(.el-tag.el-tag--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

/* 分页样式优化 */
.pagination-container {
  margin-top: 20px;
  padding: 20px;
  text-align: right;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #409EFF;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li) {
  margin: 0 4px;
  min-width: 32px;
  border-radius: 4px;
}

/* 弹窗样式优化 */
.device-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.device-dialog :deep(.el-dialog__header) {
  padding: 20px 25px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fb;
}

.device-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.device-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.device-dialog :deep(.el-dialog__footer) {
  padding: 20px 25px;
  border-top: 1px solid #ebeef5;
  background: #f8f9fb;
}

/* 表单区块样式优化 */
.form-section {
  margin-bottom: 30px;
  background: #f8f9fb;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.form-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 25px;
  padding-left: 12px;
  border-left: 4px solid #409EFF;
  display: flex;
  align-items: center;
}

/* 表单网格布局优化 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* 表单控件样式优化 */
:deep(.el-input__inner) {
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  padding: 12px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 24px;
}

:deep(.el-radio) {
  margin-right: 0;
}

.warranty-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #606266;
  font-size: 14px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-container :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .filter-container :deep(.el-input),
  .filter-container :deep(.el-select) {
    width: 100%;
  }
  
  .action-container {
    flex-wrap: wrap;
  }
  
  .action-container .el-button {
    flex: 1;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style> 