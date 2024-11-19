<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">资产维修管理</h2>
    </div>

    <el-card class="filter-container" shadow="hover">
      <el-input
        v-model="listQuery.keyword"
        placeholder="输入资产编号/名称"
        style="width: 220px;"
        class="filter-item"
        prefix-icon="el-icon-search"
        @keyup.enter.native="handleFilter"
      />
      <el-select 
        v-model="listQuery.status" 
        placeholder="维修状态" 
        clearable 
        style="width: 140px" 
        class="filter-item"
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item add-button" type="success" icon="el-icon-plus" @click="handleCreate">
        新增维修记录
      </el-button>
    </el-card>

    <el-card class="table-container" shadow="hover">
      <el-table
        :data="list"
        border
        style="width: 100%"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="资产编号" prop="assetNo" align="center" min-width="120" />
        <el-table-column label="资产名称" prop="assetName" align="center" min-width="150" />
        <el-table-column label="故障描述" prop="faultDesc" align="center" min-width="200" show-overflow-tooltip />
        <el-table-column label="维修状态" align="center" width="100">
          <template slot-scope="{row}">
            <el-tag
              :type="row.status | statusFilter"
              effect="plain"
              size="medium"
              class="status-tag"
            >
              {{ row.status | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="维修人" prop="repairPerson" align="center" width="100" />
        <el-table-column label="维修费用" align="center" width="120">
          <template slot-scope="{row}">
            <span class="cost">¥ {{ row.cost.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报修时间" prop="createTime" align="center" width="160" />
        <el-table-column label="完成时间" prop="finishTime" align="center" width="160" />
        <el-table-column label="操作" align="center" width="250" fixed="right">
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="mini"
              @click="handleUpdate(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="mini"
              @click="handleComplete(row)"
            >
              完成维修
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
      custom-class="repair-dialog"
      top="5vh"
      :destroy-on-close="true"
    >
      <div class="dialog-content">
        <el-form 
          ref="dataForm" 
          :model="temp" 
          :rules="rules"
          label-position="right" 
          label-width="120px"
          class="repair-form"
          status-icon
        >
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资产编号" prop="assetNo">
                  <el-input 
                    v-model="temp.assetNo" 
                    placeholder="请输入资产编号" 
                    clearable
                    prefix-icon="el-icon-document"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="资产名称" prop="assetName">
                  <el-input 
                    v-model="temp.assetName" 
                    placeholder="请输入资产名称" 
                    clearable
                    prefix-icon="el-icon-notebook-2"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-section">
            <div class="section-title">故障信息</div>
            <el-form-item label="故障描述" prop="faultDesc">
              <el-input 
                v-model="temp.faultDesc" 
                type="textarea" 
                :rows="4" 
                placeholder="请详细描述故障情况"
                resize="none"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <div class="section-title">维修信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="维修人" prop="repairPerson">
                  <el-input 
                    v-model="temp.repairPerson" 
                    placeholder="请输入维修人姓名" 
                    clearable
                    prefix-icon="el-icon-user"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="维修费用" prop="cost">
                  <el-input-number 
                    v-model="temp.cost" 
                    :min="0" 
                    :max="99999"
                    :precision="2" 
                    :step="100"
                    controls-position="right"
                    style="width: 100%;"
                  >
                    <template slot="prepend">¥</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button plain @click="closeDialog">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetRepair',
  filters: {
    statusFilter(status) {
      const statusMap = {
        pending: 'warning',
        processing: 'info',
        completed: 'success'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusMap = {
        pending: '待维修',
        processing: '维修中',
        completed: '已完成'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [
        {
          id: 1,
          assetNo: 'PC2024001',
          assetName: '联想台式电脑',
          faultDesc: '无法开机，主板可能损坏',
          status: 'pending',
          repairPerson: '张工',
          cost: 800,
          createTime: '2024-03-15 09:30:00',
          finishTime: null
        },
        {
          id: 2,
          assetNo: 'PR2024003',
          assetName: '惠普打印机',
          faultDesc: '打印质量差，需要更换打印头',
          status: 'completed',
          repairPerson: '李工',
          cost: 1200,
          createTime: '2024-03-14 14:20:00',
          finishTime: '2024-03-15 16:30:00'
        }
      ],
      listQuery: {
        keyword: '',
        status: ''
      },
      statusOptions: [
        { value: 'pending', label: '待维修' },
        { value: 'processing', label: '维修中' },
        { value: 'completed', label: '已完成' }
      ],
      dialogVisible: false,
      dialogTitle: '',
      temp: {
        id: undefined,
        assetNo: '',
        assetName: '',
        faultDesc: '',
        status: 'pending',
        repairPerson: '',
        cost: 0,
        createTime: '',
        finishTime: null
      },
      submitLoading: false,
      rules: {
        assetNo: [
          { required: true, message: '请输入资产编号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        assetName: [
          { required: true, message: '请输入资产名称', trigger: 'blur' }
        ],
        faultDesc: [
          { required: true, message: '请输入故障描述', trigger: 'blur' },
          { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
        ],
        repairPerson: [
          { required: true, message: '请输入维修人姓名', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入维修费用', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleFilter() {
      // 实现筛选逻辑
      console.log('执行筛选')
    },
    handleCreate() {
      this.dialogTitle = '新增维修记录'
      this.temp = {
        id: undefined,
        assetNo: '',
        assetName: '',
        faultDesc: '',
        status: 'pending',
        repairPerson: '',
        cost: 0,
        createTime: new Date().toLocaleString(),
        finishTime: null
      }
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.dialogTitle = '编辑维修记录'
      this.temp = Object.assign({}, row)
      this.dialogVisible = true
    },
    handleComplete(row) {
      this.$confirm('是否确认完成维修？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.list.findIndex(item => item.id === row.id)
        this.list[index].status = 'completed'
        this.list[index].finishTime = new Date().toLocaleString()
        this.$message({
          type: 'success',
          message: '维修完成！'
        })
      })
    },
    handleDelete(row) {
      this.$confirm('是否确认删除该维修记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.list.findIndex(item => item.id === row.id)
        this.list.splice(index, 1)
        this.$message({
          type: 'success',
          message: '删除成功！'
        })
      })
    },
    saveData() {
      if (this.temp.id) {
        // 更新
        const index = this.list.findIndex(item => item.id === this.temp.id)
        this.list.splice(index, 1, Object.assign({}, this.temp))
      } else {
        // 新增
        this.temp.id = this.list.length + 1
        this.list.push(Object.assign({}, this.temp))
      }
      this.dialogVisible = false
      this.$message({
        type: 'success',
        message: '保存成功！'
      })
    },
    closeDialog() {
      this.$refs['dataForm'].resetFields()
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: #303133;
    }
  }

  .filter-container {
    margin-bottom: 20px;
    
    .filter-item {
      margin-right: 15px;
      vertical-align: top;
    }

    .add-button {
      float: right;
    }
  }

  .table-container {
    .status-tag {
      padding: 6px 15px;
      border-radius: 4px;
      font-weight: 500;
    }

    .cost {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}

.repair-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    
    .el-dialog__header {
      padding: 20px 24px;
      background: #f8f9fb;
      border-bottom: 1px solid #ebeef5;
      margin: 0;
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
      
      .el-dialog__headerbtn {
        top: 20px;
        right: 20px;
        
        .el-dialog__close {
          font-size: 18px;
          
          &:hover {
            color: #409eff;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 0;
    }
    
    .el-dialog__footer {
      padding: 20px 24px;
      background: #f8f9fb;
      border-top: 1px solid #ebeef5;
    }
  }
  
  .dialog-content {
    padding: 24px;
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
  }
  
  .form-section {
    margin-bottom: 24px;
    padding: 20px;
    background: #f8f9fb;
    border-radius: 6px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      position: relative;
      padding-left: 12px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
      }
    }
  }
  
  .repair-form {
    .el-form-item {
      margin-bottom: 22px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
      }
      
      :deep(.el-input__inner) {
        height: 36px;
        line-height: 36px;
        border-radius: 4px;
        transition: all 0.3s;
        
        &:hover {
          border-color: #c0c4cc;
        }
        
        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }
      }
      
      :deep(.el-textarea__inner) {
        padding: 8px 12px;
        border-radius: 4px;
        font-family: inherit;
        transition: all 0.3s;
        
        &:hover {
          border-color: #c0c4cc;
        }
        
        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
    
    .el-button {
      padding: 9px 20px;
      font-size: 14px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      & + .el-button {
        margin-left: 12px;
      }
    }
  }
}

// 添加输入框hover和focus时的效果
:deep(.el-input__inner):hover,
:deep(.el-textarea__inner):hover {
  border-color: #c0c4cc;
}

:deep(.el-input__inner):focus,
:deep(.el-textarea__inner):focus {
  border-color: #409eff;
}
</style> 