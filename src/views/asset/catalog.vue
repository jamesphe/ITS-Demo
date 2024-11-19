<template>
  <div class="app-container">
    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="header-content">
        <div class="left-section">
          <h2 class="page-title">资产目录管理</h2>
          <div class="page-desc">管理各部门IT设备资产信息及借用规则</div>
        </div>
        <div class="right-section">
          <el-button type="success" icon="el-icon-plus" class="add-button" @click="handleCreate">
            添加资产
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-row :gutter="20">
        <el-col :span="7">
          <div class="search-item">
            <i class="el-icon-search search-icon"></i>
            <el-input
              v-model="listQuery.keyword"
              placeholder="搜索资产名称/编号"
              class="filter-item"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </div>
        </el-col>
        <el-col :span="5">
          <el-select 
            v-model="listQuery.department" 
            placeholder="所属部门" 
            clearable 
            class="filter-item"
            popper-class="custom-select-dropdown"
          >
            <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value">
              <i class="el-icon-office-building option-icon"></i>
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select 
            v-model="listQuery.category" 
            placeholder="资产类别" 
            clearable 
            class="filter-item"
            popper-class="custom-select-dropdown"
          >
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value">
              <i class="el-icon-monitor option-icon"></i>
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" class="search-button" @click="handleFilter">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="data-statistics">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <i class="el-icon-monitor stat-icon"></i>
            <div class="stat-info">
              <div class="stat-value">{{ totalAssets }}</div>
              <div class="stat-label">总资产数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <i class="el-icon-s-cooperation stat-icon available"></i>
            <div class="stat-info">
              <div class="stat-value">{{ availableAssets }}</div>
              <div class="stat-label">可用资产</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <i class="el-icon-s-order stat-icon borrowed"></i>
            <div class="stat-info">
              <div class="stat-value">{{ borrowedAssets }}</div>
              <div class="stat-label">借出资产</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <i class="el-icon-warning-outline stat-icon maintenance"></i>
            <div class="stat-info">
              <div class="stat-value">{{ maintenanceAssets }}</div>
              <div class="stat-label">维修中资产</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-container" shadow="hover">
      <el-table
        :data="list"
        border
        style="width: 100%"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="custom-table"
      >
        <el-table-column label="资产编号" prop="code" align="center" width="120">
          <template slot-scope="{row}">
            <div class="asset-code-container">
              <span class="asset-code">{{ row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="资产名称" prop="name" align="center" min-width="120">
          <template slot-scope="{row}">
            <div class="asset-name-container">
              <i class="el-icon-monitor asset-icon"></i>
              <span class="asset-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="资产类别" prop="category" align="center" width="120">
          <template slot-scope="{row}">
            <el-tag size="medium" effect="light" class="category-tag">
              <i class="el-icon-collection-tag"></i>
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属部门" prop="department" align="center" width="120">
          <template slot-scope="{row}">
            <div class="department-container">
              <i class="el-icon-office-building"></i>
              <span>{{ row.department }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="管理员" prop="manager" align="center" width="120">
          <template slot-scope="{row}">
            <el-tooltip :content="'联系方式: ' + getManagerContact(row.manager)" placement="top">
              <div class="manager-container">
                <i class="el-icon-user"></i>
                <span class="manager-name">{{ row.manager }}</span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter" effect="dark" class="status-tag">
              <i :class="getStatusIcon(row.status)"></i>
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借用规则" align="center" width="120">
          <template slot-scope="{row}">
            <el-tag 
              :type="row.borrowRule === '需审批' ? 'warning' : 'info'"
              effect="light"
              class="rule-tag"
            >
              <i class="el-icon-setting"></i>
              {{ row.borrowRule }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template slot-scope="{row}">
            <div class="button-group">
              <el-button size="mini" type="primary" plain class="action-button" @click="handleEdit(row)">
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-button size="mini" type="success" plain class="action-button" @click="handleSetRule(row)">
                <i class="el-icon-setting"></i> 规则
              </el-button>
              <el-button size="mini" type="danger" plain class="action-button" @click="handleDelete(row)">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑资产对话框 -->
    <el-dialog 
      :title="dialogStatus === 'create' ? '添加资产' : '编辑资产'" 
      :visible.sync="dialogFormVisible"
      width="650px"
      :close-on-click-modal="false"
      custom-class="asset-dialog"
    >
      <div class="dialog-body">
        <el-form 
          ref="dataForm" 
          :model="temp" 
          :rules="rules"
          label-position="right" 
          label-width="120px"
          class="asset-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="资产编号" prop="code">
                <el-input 
                  v-model="temp.code"
                  placeholder="系统自动生成"
                  :disabled="dialogStatus === 'update'"
                >
                  <template slot="prepend">IT</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资产名称" prop="name">
                <el-input 
                  v-model="temp.name"
                  placeholder="请输入资产名称"
                >
                  <i slot="prefix" class="el-icon-monitor"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="资产类别" prop="category">
                <el-select 
                  v-model="temp.category" 
                  placeholder="请选择资产类别"
                  class="full-width"
                >
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <i class="el-icon-collection-tag option-icon"></i>
                    <span>{{ item.label }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属部门" prop="department">
                <el-select 
                  v-model="temp.department"
                  placeholder="请选择所属部门"
                  class="full-width"
                >
                  <el-option
                    v-for="item in departmentOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <i class="el-icon-office-building option-icon"></i>
                    <span>{{ item.label }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="管理员" prop="manager">
                <el-select 
                  v-model="temp.manager"
                  placeholder="请选择管理员"
                  class="full-width"
                  filterable
                >
                  <el-option
                    v-for="item in managerOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <i class="el-icon-user option-icon"></i>
                    <span>{{ item.label }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始状态" prop="status">
                <el-select 
                  v-model="temp.status"
                  placeholder="请选择初始状态"
                  class="full-width"
                >
                  <el-option label="可用" value="可用">
                    <i class="el-icon-check option-icon success"></i>
                    <span>可用</span>
                  </el-option>
                  <el-option label="维修中" value="维修中">
                    <i class="el-icon-warning option-icon danger"></i>
                    <span>维修中</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="资产描述" prop="description">
            <el-input
              v-model="temp.description"
              type="textarea"
              :rows="3"
              placeholder="请输入资产描述信息"
            />
          </el-form-item>

          <el-form-item label="附件上传">
            <el-upload
              class="asset-upload"
              action="#"
              :auto-upload="false"
              :limit="5"
              multiple
            >
              <el-button size="small" type="primary">
                <i class="el-icon-upload2"></i> 点击上传
              </el-button>
              <div slot="tip" class="el-upload__tip">可上传资产图片或相关文档，单个文件不超过10MB</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" size="medium">取 消</el-button>
        <el-button 
          type="primary" 
          @click="dialogStatus === 'create' ? createData() : updateData()"
          size="medium"
        >确 定</el-button>
      </div>
    </el-dialog>

    <!-- 设置规则对话框 -->
    <el-dialog title="设置借用规则" :visible.sync="ruleDialogVisible">
      <el-form ref="ruleForm" :model="ruleTemp" label-position="left" label-width="100px">
        <el-form-item label="最大借用天数">
          <el-input-number v-model="ruleTemp.maxDays" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="是否需要审批">
          <el-switch v-model="ruleTemp.needApproval" />
        </el-form-item>
        <el-form-item label="借用权限">
          <el-select v-model="ruleTemp.borrowPermission" multiple placeholder="请选择可借用的角色">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRule">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetCatalog',
  filters: {
    statusFilter(status) {
      const statusMap = {
        '可用': 'success',
        '借出': 'warning',
        '维修中': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [
        {
          code: 'IT001',
          name: '联想ThinkPad笔记本',
          category: '笔记本电脑',
          department: '信息中心',
          manager: '张三',
          status: '可用',
          borrowRule: '需审批'
        },
        {
          code: 'IT002',
          name: '投影仪',
          category: '多媒体设备',
          department: '教务处',
          manager: '李四',
          status: '借出',
          borrowRule: '直接借用'
        }
      ],
      listQuery: {
        keyword: '',
        department: '',
        category: ''
      },
      departmentOptions: [
        { value: '信息中心', label: '信息中心' },
        { value: '教务处', label: '教务处' },
        { value: '实验室', label: '实验室' }
      ],
      categoryOptions: [
        { value: '笔记本电脑', label: '笔记本电脑' },
        { value: '台式电脑', label: '台式电脑' },
        { value: '多媒体设备', label: '多媒体设备' },
        { value: '网络设备', label: '网络设备' }
      ],
      managerOptions: [
        { value: '张三', label: '张三' },
        { value: '李四', label: '李四' },
        { value: '王五', label: '王五' }
      ],
      roleOptions: [
        { value: 'teacher', label: '教师' },
        { value: 'student', label: '学生' },
        { value: 'staff', label: '职工' }
      ],
      dialogFormVisible: false,
      ruleDialogVisible: false,
      dialogStatus: 'create',
      temp: {
        code: '',
        name: '',
        category: '',
        department: '',
        manager: '',
        status: '可用',
        description: ''
      },
      ruleTemp: {
        maxDays: 7,
        needApproval: true,
        borrowPermission: []
      },
      totalAssets: 156,
      availableAssets: 98,
      borrowedAssets: 45,
      maintenanceAssets: 13,
      rules: {
        name: [
          { required: true, message: '请输入资产名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择资产类别', trigger: 'change' }
        ],
        department: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ],
        manager: [
          { required: true, message: '请选择管理员', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择初始状态', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    handleFilter() {
      // 实现筛选逻辑
      console.log('筛选查询')
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleSetRule(row) {
      this.ruleDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该资产?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    createData() {
      this.$message({
        message: '添加成功',
        type: 'success'
      })
      this.dialogFormVisible = false
    },
    updateData() {
      this.$message({
        message: '更新成功',
        type: 'success'
      })
      this.dialogFormVisible = false
    },
    updateRule() {
      this.$message({
        message: '规则设置成功',
        type: 'success'
      })
      this.ruleDialogVisible = false
    },
    getManagerContact(manager) {
      const contacts = {
        '张三': '13800138000',
        '李四': '13900139000',
        '王五': '13700137000'
      }
      return contacts[manager] || '暂无联系方式'
    },
    getStatusIcon(status) {
      const iconMap = {
        '可用': 'el-icon-check',
        '借出': 'el-icon-time',
        '维修中': 'el-icon-warning'
      }
      return iconMap[status]
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-section {
      .page-title {
        font-size: 24px;
        color: #303133;
        margin: 0 0 8px 0;
        font-weight: 600;
      }

      .page-desc {
        font-size: 14px;
        color: #909399;
      }
    }

    .add-button {
      padding: 12px 20px;
      font-size: 14px;
    }
  }
}

.filter-container {
  margin-bottom: 24px;
  
  .search-item {
    position: relative;
    
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #909399;
      z-index: 2;
    }

    .el-input {
      input {
        padding-left: 35px;
      }
    }
  }

  .filter-item {
    width: 100%;
  }

  .search-button {
    width: 120px;
    padding: 12px 20px;
  }
}

.data-statistics {
  margin-bottom: 24px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      padding: 10px;

      .stat-icon {
        font-size: 48px;
        margin-right: 20px;
        color: #409EFF;

        &.available { color: #67C23A; }
        &.borrowed { color: #E6A23C; }
        &.maintenance { color: #F56C6C; }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.custom-table {
  .asset-code-container {
    .asset-code {
      color: #409EFF;
      font-family: Monaco, monospace;
      font-weight: bold;
      background: rgba(64, 158, 255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .asset-name-container {
    display: flex;
    align-items: center;
    justify-content: center;

    .asset-icon {
      margin-right: 8px;
      color: #606266;
    }

    .asset-name {
      color: #303133;
      font-weight: 500;
    }
  }

  .department-container {
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      margin-right: 5px;
      color: #909399;
    }
  }

  .manager-container {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    i {
      margin-right: 5px;
      color: #909399;
    }

    &:hover {
      color: #409EFF;
    }
  }

  .status-tag {
    i {
      margin-right: 4px;
    }
  }

  .rule-tag {
    i {
      margin-right: 4px;
    }
  }

  .button-group {
    .action-button {
      margin: 0 4px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }
  }
}

.custom-select-dropdown {
  .option-icon {
    margin-right: 8px;
    color: #909399;
  }
}

// 添加过渡动画
.el-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
}

.el-tag {
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.el-button {
  transition: all 0.3s ease;
}

// 自定义滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.asset-dialog {
  .dialog-body {
    padding: 20px 20px 0;
  }

  .asset-form {
    .el-form-item {
      margin-bottom: 22px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    .el-input {
      .el-input__prefix {
        left: 10px;
        color: #909399;
      }

      input {
        padding-left: 35px;
      }
    }

    .full-width {
      width: 100%;
    }

    .option-icon {
      margin-right: 8px;
      font-size: 14px;

      &.success {
        color: #67C23A;
      }

      &.danger {
        color: #F56C6C;
      }
    }
  }

  .asset-upload {
    .el-upload__tip {
      color: #909399;
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .dialog-footer {
    padding: 20px;
    text-align: right;
    
    .el-button {
      padding: 9px 20px;
      
      & + .el-button {
        margin-left: 12px;
      }
    }
  }
}

// 添加输入框hover效果
.el-input:hover .el-input__inner,
.el-textarea:hover .el-textarea__inner {
  border-color: #409EFF;
}

// 添加select hover效果
.el-select:hover .el-input__inner {
  border-color: #409EFF;
}

// 美化上传按钮
.asset-upload {
  .el-button {
    border-radius: 4px;
    padding: 8px 16px;
    
    i {
      margin-right: 4px;
    }
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }
}
</style> 