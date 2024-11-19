<template>
  <div class="app-container">
    <h2>领用资产库</h2>
    
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
                <el-option label="办公电脑" value="computer" />
                <el-option label="显示器" value="monitor" />
                <el-option label="键盘" value="keyboard" />
                <el-option label="鼠标" value="mouse" />
                <el-option label="办公设备" value="office" />
                <el-option label="其他配件" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="使用部门">
              <el-select v-model="queryParams.department" placeholder="请选择使用部门">
                <el-option label="信息技术部" value="it" />
                <el-option label="教务处" value="academic" />
                <el-option label="学生处" value="student" />
                <el-option label="行政办公室" value="admin" />
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
      style="width: 100%"
    >
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column label="资产编号" prop="code" width="120" align="center" />
      <el-table-column label="设备名称" prop="name" min-width="150" show-overflow-tooltip />
      <el-table-column label="设备类型" prop="type" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getDeviceTypeTag(row.type)" effect="plain">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用部门" prop="department" width="120" align="center" />
      <el-table-column label="资产归属" prop="belongDept" width="120" align="center">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">
            {{ row.belongDept }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用人" prop="user" width="100" align="center" />
      <el-table-column label="领用日期" prop="assignDate" width="120" align="center" />
      <el-table-column label="使用状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '使用中' ? 'success' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="text" 
            size="small" 
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            @click="handleTransfer(row)"
          >
            资产转移
          </el-button>
          <el-button 
            type="text" 
            class="delete-btn"
            size="small" 
            @click="handleDelete(row)"
          >
            删除
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
      width="800px"
      custom-class="device-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="5vh"
    >
      <el-form ref="deviceForm" :model="deviceForm" :rules="rules" label-width="100px" class="device-form">
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info section-icon"></i>
            基本信息
          </div>
          <div class="form-grid">
            <el-form-item label="资产编号" prop="code">
              <el-input 
                v-model="deviceForm.code" 
                placeholder="请输入资产编号"
                prefix-icon="el-icon-price-tag"
              />
            </el-form-item>
            <el-form-item label="设备名称" prop="name">
              <el-input 
                v-model="deviceForm.name" 
                placeholder="请输入设备名称"
                prefix-icon="el-icon-monitor"
              />
            </el-form-item>
            <el-form-item label="设备类型" prop="type">
              <el-select 
                v-model="deviceForm.type" 
                placeholder="请选择设备类型" 
                class="full-width"
                popper-class="device-select"
              >
                <el-option label="办公电脑" value="computer">
                  <i class="el-icon-monitor option-icon"></i>
                  办公电脑
                </el-option>
                <el-option label="显示器" value="monitor">
                  <i class="el-icon-video-camera option-icon"></i>
                  显示器
                </el-option>
                <el-option label="键盘" value="keyboard">
                  <i class="el-icon-tickets option-icon"></i>
                  键盘
                </el-option>
                <el-option label="鼠标" value="mouse">
                  <i class="el-icon-mouse option-icon"></i>
                  鼠标
                </el-option>
                <el-option label="办公设备" value="office">
                  <i class="el-icon-printer option-icon"></i>
                  办公设备
                </el-option>
                <el-option label="其他配件" value="other">
                  <i class="el-icon-more option-icon"></i>
                  其他配件
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="使用部门" prop="department">
              <el-select v-model="deviceForm.department" placeholder="请选择使用部门">
                <el-option label="信息技术部" value="it" />
                <el-option label="教务处" value="academic" />
                <el-option label="学生处" value="student" />
                <el-option label="行政办公室" value="admin" />
              </el-select>
            </el-form-item>
            <el-form-item label="资产归属" prop="belongDept">
              <el-select v-model="deviceForm.belongDept" placeholder="请选择资产归属部门">
                <el-option label="信息技术中心" value="itc" />
                <el-option label="实验室管理处" value="lab" />
                <el-option label="资产管理处" value="asset" />
                <el-option label="后勤保障处" value="logistics" />
              </el-select>
            </el-form-item>
            <el-form-item label="使用人" prop="user">
              <el-input v-model="deviceForm.user" placeholder="请输入使用人姓名" />
            </el-form-item>
            <el-form-item label="领用日期" prop="assignDate">
              <el-date-picker
                v-model="deviceForm.assignDate"
                type="date"
                placeholder="选择领用日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-setting section-icon"></i>
            设备信息
          </div>
          <div class="form-grid">
            <el-form-item label="品牌型号" prop="model">
              <el-input 
                v-model="deviceForm.model" 
                placeholder="请输入品牌型号"
                prefix-icon="el-icon-goods"
              />
            </el-form-item>
            <el-form-item label="使用年限" prop="lifespan">
              <div class="warranty-input">
                <el-input-number 
                  v-model="deviceForm.lifespan" 
                  :min="1" 
                  :max="10"
                  controls-position="right"
                  class="lifespan-input"
                />
                <span class="unit-text">年</span>
              </div>
            </el-form-item>
            <el-form-item label="使用状态" prop="status">
              <el-radio-group v-model="deviceForm.status" class="status-group">
                <el-radio label="使用中">
                  <i class="el-icon-success status-icon"></i>
                  使用中
                </el-radio>
                <el-radio label="维修中">
                  <i class="el-icon-warning status-icon"></i>
                  维修中
                </el-radio>
                <el-radio label="闲置中">
                  <i class="el-icon-info status-icon"></i>
                  闲置中
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <el-form-item label="备注信息" prop="remarks">
            <el-input
              v-model="deviceForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              resize="none"
              class="remarks-input"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false" plain>取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 资产转移对话框 -->
    <el-dialog 
      title="资产转移" 
      :visible.sync="transferDialog.visible" 
      width="550px"
      custom-class="transfer-dialog"
      :close-on-click-modal="false"
      top="15vh"
    >
      <el-form 
        ref="transferForm"
        :model="transferForm" 
        :rules="transferRules"
        label-width="100px"
        class="transfer-form"
      >
        <div class="transfer-info">
          <div class="info-item">
            <span class="label">当前部门：</span>
            <span class="value">{{ currentDepartment }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前使用人：</span>
            <span class="value">{{ currentUser }}</span>
          </div>
        </div>

        <div class="divider">
          <span class="divider-text">转移信息</span>
        </div>

        <el-form-item label="转移部门" prop="department">
          <el-select 
            v-model="transferForm.department" 
            placeholder="请选择转移部门"
            class="form-select"
          >
            <el-option 
              v-for="dept in departmentOptions" 
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            >
              <i class="el-icon-office-building option-icon"></i>
              {{ dept.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收人" prop="user">
          <el-input 
            v-model="transferForm.user" 
            placeholder="请输入接收人姓名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item label="转移日期" prop="transferDate">
          <el-date-picker
            v-model="transferForm.transferDate"
            type="date"
            placeholder="请选择转移日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="转移原因" prop="reason">
          <el-input
            v-model="transferForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入转移原因"
            resize="none"
            class="reason-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="transferDialog.visible = false" plain>取 消</el-button>
          <el-button type="primary" @click="submitTransfer" :loading="transferLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssignLib',
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: '',
        department: ''
      },
      // 加载状态
      loading: false,
      // 设备列表数据
      deviceList: [
        {
          code: 'PC001',
          name: 'ThinkPad E15',
          type: '办公电脑',
          department: '信息技术部',
          belongDept: '信息技术中心',
          user: '张三',
          assignDate: '2024-01-15',
          status: '使用中'
        },
        {
          code: 'MN001',
          name: 'Dell P2419H',
          type: '显示器',
          department: '教务处',
          belongDept: '信息技术中心',
          user: '李四',
          assignDate: '2024-02-01',
          status: '使用中'
        }
      ],
      total: 2,
      selectedRows: [],
      dialog: {
        title: '',
        visible: false
      },
      deviceForm: {
        code: '',
        name: '',
        type: '',
        department: '',
        belongDept: '',
        user: '',
        assignDate: '',
        model: '',
        lifespan: 3,
        status: '使用中',
        remarks: ''
      },
      rules: {
        code: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        department: [{ required: true, message: '请选择使用部门', trigger: 'change' }],
        belongDept: [{ required: true, message: '请选择资产归属部门', trigger: 'change' }],
        user: [{ required: true, message: '请输入使用人', trigger: 'blur' }],
        assignDate: [{ required: true, message: '请选择领用日期', trigger: 'change' }]
      },
      transferDialog: {
        visible: false
      },
      transferForm: {
        department: '',
        user: '',
        transferDate: '',
        reason: ''
      },
      transferRules: {
        department: [
          { required: true, message: '请选择转移部门', trigger: 'change' }
        ],
        user: [
          { required: true, message: '请输入接收人姓名', trigger: 'blur' }
        ],
        transferDate: [
          { required: true, message: '请选择转移日期', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入转移原因', trigger: 'blur' }
        ]
      },
      transferLoading: false,
      departmentOptions: [
        { label: '信息技术部', value: 'it' },
        { label: '教务处', value: 'academic' },
        { label: '学生处', value: 'student' },
        { label: '行政办公室', value: 'admin' }
      ],
      currentDepartment: '',
      currentUser: ''
    }
  },
  methods: {
    handleSearch() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: '',
        department: ''
      }
      this.handleSearch()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleAdd() {
      this.dialog.title = '新增设备'
      this.deviceForm = {
        code: '',
        name: '',
        type: '',
        department: '',
        belongDept: '',
        user: '',
        assignDate: '',
        model: '',
        lifespan: 3,
        status: '使用中',
        remarks: ''
      }
      this.dialog.visible = true
    },
    handleEdit(row) {
      this.dialog.title = '编辑设备'
      this.deviceForm = { ...row }
      this.dialog.visible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该设备记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      })
    },
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的设备')
        return
      }
      this.$confirm(`确认删除选中的 ${this.selectedRows.length} 个设备记录吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('批量删除成功')
      })
    },
    handleTransfer(row) {
      this.currentDepartment = row.department
      this.currentUser = row.user
      this.transferForm = {
        department: '',
        user: '',
        transferDate: '',
        reason: ''
      }
      this.transferDialog.visible = true
    },
    submitForm() {
      this.$refs.deviceForm.validate(valid => {
        if (valid) {
          this.loading = true
          setTimeout(() => {
            if (this.dialog.title === '新增设备') {
              this.deviceList.unshift({ ...this.deviceForm })
              this.total += 1
            } else {
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
    submitTransfer() {
      this.$refs.transferForm.validate(valid => {
        if (valid) {
          this.transferLoading = true
          setTimeout(() => {
            this.$message.success('资产转移成功')
            this.transferDialog.visible = false
            this.transferLoading = false
          }, 500)
        }
      })
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.handleSearch()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.handleSearch()
    },
    getDeviceTypeTag(type) {
      const typeMap = {
        '办公电脑': 'primary',
        '显示器': 'success',
        '键盘': 'info',
        '鼠标': 'info',
        '办公设备': 'warning',
        '其他配件': ''
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
@import '@/styles/asset-common.css';

/* 领用资产库特有的样式 */
.form-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.warranty-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-text {
  color: #606266;
}

@media screen and (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 弹窗样式优化 */
.device-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    box-shadow: 0 12px 32px 4px rgba(0, 0, 0, .1);
  }

  :deep(.el-dialog__header) {
    background: #f8f9fb;
    padding: 20px 25px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
  }

  :deep(.el-dialog__body) {
    padding: 30px 25px;
    max-height: calc(90vh - 150px);
    overflow-y: auto;
  }
}

/* 表单区块样式 */
.device-form {
  .form-section {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #ebeef5;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 24px;
      padding-left: 12px;
      border-left: 4px solid #409EFF;

      .section-icon {
        margin-right: 8px;
        font-size: 18px;
        color: #409EFF;
      }
    }
  }
}

/* 表单控件样式 */
:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409EFF;
  }

  &:focus {
    border-color: #409EFF;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

:deep(.el-input__prefix) {
  left: 8px;
  color: #909399;
}

:deep(.el-input--prefix .el-input__inner) {
  padding-left: 35px;
}

/* 下拉选择框样式 */
.device-select {
  :deep(.el-select-dropdown__item) {
    height: 40px;
    line-height: 40px;
    
    .option-icon {
      margin-right: 8px;
      font-size: 16px;
      vertical-align: middle;
    }
  }
}

/* 使用状态单选框组样式 */
.status-group {
  :deep(.el-radio) {
    margin-right: 24px;
    padding: 8px 16px;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f5f7fa;
    }

    &.is-checked {
      background-color: #ecf5ff;
    }

    .status-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}

/* 使用年限输入框样式 */
.lifespan-input {
  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    border-radius: 4px;
    background-color: #f5f7fa;
    
    &:hover {
      color: #409EFF;
    }
  }
}

/* 备注输入框样式 */
.remarks-input {
  :deep(.el-textarea__inner) {
    padding: 12px;
    border-radius: 4px;
    resize: none;
    
    &:hover {
      border-color: #409EFF;
    }
    
    &:focus {
      border-color: #409EFF;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
  padding: 20px 25px;
  background: #f8f9fb;
  border-top: 1px solid #ebeef5;

  :deep(.el-button) {
    padding: 10px 24px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  :deep(.el-button--primary) {
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

/* 资产转移对话框样式 */
.transfer-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    box-shadow: 0 12px 32px 4px rgba(0, 0, 0, .1);
  }

  :deep(.el-dialog__header) {
    padding: 20px 25px;
    background: #f8f9fb;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-dialog__body) {
    padding: 25px;
  }
}

.transfer-form {
  .transfer-info {
    background: #f8f9fb;
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 24px;

    .info-item {
      display: flex;
      align-items: center;
      line-height: 32px;
      
      .label {
        color: #606266;
        margin-right: 12px;
        font-size: 14px;
      }
      
      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 24px 0;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: #ebeef5;
    }
    
    .divider-text {
      position: relative;
      display: inline-block;
      padding: 0 12px;
      background: #fff;
      color: #909399;
      font-size: 14px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  .form-select {
    width: 100%;
    
    :deep(.option-icon) {
      margin-right: 8px;
      font-size: 14px;
      color: #909399;
    }
  }

  .reason-input {
    :deep(.el-textarea__inner) {
      padding: 12px;
      border-radius: 4px;
      
      &:hover {
        border-color: #409EFF;
      }
      
      &:focus {
        border-color: #409EFF;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }
}
</style> 