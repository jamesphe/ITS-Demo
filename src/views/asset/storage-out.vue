<template>
  <div class="app-container">
    <div class="page-header">
      <h2>资产出库</h2>
      <div class="header-desc">管理和记录资产出库信息，支持多种出库方式</div>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form" size="small">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.outNo" placeholder="请输入出库单号" clearable>
            <i slot="prefix" class="el-icon-document"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="出库类型">
          <el-select v-model="searchForm.outType" placeholder="请选择" clearable>
            <el-option label="面对面派送" value="face">
              <i class="el-icon-user"></i> 面对面派送
            </el-option>
            <el-option label="上门派送" value="delivery">
              <i class="el-icon-position"></i> 上门派送
            </el-option>
            <el-option label="智能快递柜" value="locker">
              <i class="el-icon-box"></i> 智能快递柜
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
          <el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="operation-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增出库</el-button>
      <el-button type="success" icon="el-icon-upload2" @click="handleBatchOut">批量出库</el-button>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        highlight-current-row
        @row-click="handleRowClick">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="outNo" label="出库单号" width="180"></el-table-column>
        <el-table-column prop="outType" label="出库类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getOutTypeTag(scope.row.outType)">{{ scope.row.outType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assetName" label="资产名称"></el-table-column>
        <el-table-column prop="assetNo" label="资产编号" width="150"></el-table-column>
        <el-table-column prop="recipient" label="领用人" width="120"></el-table-column>
        <el-table-column prop="department" label="领用部门" width="150"></el-table-column>
        <el-table-column prop="outDate" label="出库日期" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="handlePrint(scope.row)">打印</el-button>
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

    <!-- 新增/编辑出库弹窗 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="65%"
      :close-on-click-modal="false"
      custom-class="storage-out-dialog"
      @close="resetOutForm">
      <el-steps :active="activeStep" finish-status="success" class="out-steps">
        <el-step title="基本信息" icon="el-icon-document"></el-step>
        <el-step title="选择资产" icon="el-icon-cpu"></el-step>
        <el-step title="确认信息" icon="el-icon-check"></el-step>
      </el-steps>

      <el-form :model="outForm" :rules="rules" ref="outForm" label-width="100px" size="small" class="out-form">
        <!-- 步骤1：基本信息 -->
        <div v-show="activeStep === 0">
          <el-card class="form-card" shadow="never">
            <div slot="header" class="card-header">
              <span><i class="el-icon-document"></i> 出库基本信息</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出库类型" prop="outType">
                  <el-select v-model="outForm.outType" placeholder="请选择出库类型" class="full-width">
                    <el-option label="面对面派送" value="face">
                      <i class="el-icon-user"></i> 面对面派送
                    </el-option>
                    <el-option label="上门派送" value="delivery">
                      <i class="el-icon-position"></i> 上门派送
                    </el-option>
                    <el-option label="智能快递柜" value="locker">
                      <i class="el-icon-box"></i> 智能快递柜
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="预计日期" prop="expectedDate">
                  <el-date-picker
                    v-model="outForm.expectedDate"
                    type="datetime"
                    placeholder="选择预计出库日期"
                    class="full-width">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="领用人" prop="recipient">
                  <el-input v-model="outForm.recipient" placeholder="请输入领用人姓名">
                    <i slot="prefix" class="el-icon-user"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="outForm.phone" placeholder="请输入联系电话">
                    <i slot="prefix" class="el-icon-phone"></i>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="领用部门" prop="department">
                  <el-cascader
                    v-model="outForm.department"
                    :options="departmentOptions"
                    placeholder="请选择领用部门"
                    class="full-width">
                  </el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用途分类" prop="purpose">
                  <el-select v-model="outForm.purpose" placeholder="请选择用途" class="full-width">
                    <el-option label="教学使用" value="teaching"></el-option>
                    <el-option label="科研项目" value="research"></el-option>
                    <el-option label="行政办公" value="office"></el-option>
                    <el-option label="学生活动" value="student"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="备注说明" prop="remarks">
              <el-input 
                type="textarea" 
                v-model="outForm.remarks" 
                rows="3" 
                placeholder="请输入备注信息（选填）">
              </el-input>
            </el-form-item>
          </el-card>
        </div>

        <!-- 步骤2：选择资产 -->
        <div v-show="activeStep === 1">
          <el-card class="form-card" shadow="never">
            <div slot="header" class="card-header">
              <span><i class="el-icon-cpu"></i> 资产选择</span>
              <el-button type="primary" size="small" @click="showAssetSelection" icon="el-icon-plus">
                添加资产
              </el-button>
            </div>
            
            <el-table
              v-if="outForm.assets.length > 0"
              :data="outForm.assets"
              border
              class="asset-table">
              <el-table-column type="index" width="50" label="序号"></el-table-column>
              <el-table-column prop="name" label="资产名称"></el-table-column>
              <el-table-column prop="no" label="资产编号" width="150"></el-table-column>
              <el-table-column prop="category" label="分类" width="120"></el-table-column>
              <el-table-column prop="specs" label="规格型号" width="150"></el-table-column>
              <el-table-column label="操作" width="90" fixed="right">
                <template slot-scope="scope">
                  <el-button 
                    type="text" 
                    icon="el-icon-delete" 
                    @click="removeAsset(scope.row)"
                    class="delete-btn">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div v-else class="empty-assets">
              <i class="el-icon-box"></i>
              <p>暂未选择资产，请点击上方"添加资产"按钮选择</p>
            </div>
          </el-card>
        </div>

        <!-- 步骤3：确认信息 -->
        <div v-show="activeStep === 2">
          <el-card class="form-card" shadow="never">
            <div slot="header" class="card-header">
              <span><i class="el-icon-check"></i> 确认出库信息</span>
            </div>
            
            <el-descriptions border :column="2">
              <el-descriptions-item label="出库类型">
                <el-tag size="medium">{{ outForm.outType }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="预计日期">
                {{ outForm.expectedDate }}
              </el-descriptions-item>
              <el-descriptions-item label="领用人">
                {{ outForm.recipient }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ outForm.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="领用部门">
                {{ outForm.department }}
              </el-descriptions-item>
              <el-descriptions-item label="用途分类">
                {{ outForm.purpose }}
              </el-descriptions-item>
              <el-descriptions-item label="备注说明" :span="2">
                {{ outForm.remarks || '无' }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="confirm-assets">
              <div class="confirm-title">出库资产清单</div>
              <el-table :data="outForm.assets" border size="small">
                <el-table-column type="index" width="50" label="序号"></el-table-column>
                <el-table-column prop="name" label="资产名称"></el-table-column>
                <el-table-column prop="no" label="资产编号" width="150"></el-table-column>
                <el-table-column prop="category" label="分类" width="120"></el-table-column>
                <el-table-column prop="specs" label="规格型号" width="150"></el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" icon="el-icon-close">取 消</el-button>
        <el-button v-if="activeStep > 0" @click="prevStep" icon="el-icon-arrow-left">上一步</el-button>
        <el-button 
          v-if="activeStep < 2" 
          type="primary" 
          @click="nextStep" 
          icon="el-icon-arrow-right">
          下一步
        </el-button>
        <el-button 
          v-else 
          type="primary" 
          @click="submitForm" 
          icon="el-icon-check">
          提交出库
        </el-button>
      </div>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog 
      title="出库单详情" 
      :visible.sync="detailDialogVisible" 
      width="60%"
      custom-class="storage-out-detail-dialog">
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item label="出库单号">
          {{ detailForm.outNo }}
        </el-descriptions-item>
        <el-descriptions-item label="出库类型">
          <el-tag :type="getOutTypeTag(detailForm.outType)">{{ detailForm.outType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="领用人">
          <el-tag size="medium" effect="plain">
            <i class="el-icon-user"></i> {{ detailForm.recipient }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="领用部门">
          <el-tag size="medium" effect="plain">
            <i class="el-icon-office-building"></i> {{ detailForm.department }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出库日期">
          {{ detailForm.outDate }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(detailForm.status)">{{ detailForm.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detailForm.remarks || '暂无备注' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-divider">
        <div class="divider-title">资产信息</div>
      </div>

      <el-table 
        :data="detailForm.assets" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        class="asset-detail-table">
        <el-table-column prop="name" label="资产名称"></el-table-column>
        <el-table-column prop="no" label="资产编号" width="150"></el-table-column>
        <el-table-column prop="category" label="资产分类" width="120"></el-table-column>
        <el-table-column prop="specs" label="规格型号" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag size="small" type="success">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="detail-divider">
        <div class="divider-title">操作记录</div>
      </div>

      <el-timeline class="operation-timeline">
        <el-timeline-item
          v-for="(activity, index) in detailForm.activities"
          :key="index"
          :type="activity.type"
          :timestamp="activity.timestamp">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handlePrint(detailForm)" icon="el-icon-printer">打印出库单</el-button>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StorageOut',
  data() {
    return {
      searchForm: {
        outNo: '',
        outType: ''
      },
      tableData: [
        {
          outNo: 'CK202403150001',
          outType: '面对面派送',
          assetName: 'ThinkPad笔记本电脑',
          assetNo: 'NB202401010001',
          recipient: '张三',
          department: '信息工程学院',
          outDate: '2024-03-15 10:30:00',
          status: '已完成'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 100,
      dialogVisible: false,
      dialogTitle: '新增出库',
      activeStep: 0,
      rules: {
        outType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
        expectedDate: [{ required: true, message: '请选择预计出库日期', trigger: 'change' }],
        recipient: [{ required: true, message: '请输入领用人姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        department: [{ required: true, message: '请选择领用部门', trigger: 'change' }],
        purpose: [{ required: true, message: '请选择用途分类', trigger: 'change' }]
      },
      departmentOptions: [
        {
          value: 'jsjxy',
          label: '计算机学院',
          children: [
            { value: 'jsjkx', label: '计算机科学系' },
            { value: 'rjgc', label: '软件工程系' }
          ]
        },
        {
          value: 'xxgcxy',
          label: '信息工程学院',
          children: [
            { value: 'dzkx', label: '电子科学系' },
            { value: 'txgc', label: '通信工程系' }
          ]
        }
      ],
      outForm: {
        outType: '',
        expectedDate: '',
        recipient: '',
        phone: '',
        department: [],
        purpose: '',
        remarks: '',
        assets: []
      },
      detailDialogVisible: false,
      detailForm: {
        outNo: '',
        outType: '',
        recipient: '',
        department: '',
        outDate: '',
        status: '',
        remarks: '',
        assets: [],
        activities: []
      }
    }
  },
  methods: {
    handleSearch() {
      // 模拟搜索
      this.$message.success('搜索成功')
    },
    resetForm() {
      this.searchForm = {
        outNo: '',
        outType: ''
      }
    },
    handleAdd() {
      this.dialogTitle = '新增出库'
      this.dialogVisible = true
    },
    handleBatchOut() {
      this.$message.info('批量出库功能开发中...')
    },
    handleDetail(row) {
      this.detailDialogVisible = true
      // 模拟获取详细数据
      this.detailForm = {
        outNo: row.outNo,
        outType: row.outType,
        recipient: row.recipient,
        department: row.department,
        outDate: row.outDate,
        status: row.status,
        remarks: '这是一个测试备注信息',
        assets: [
          {
            name: 'ThinkPad笔记本电脑',
            no: 'NB202401010001',
            category: '笔记本电脑',
            specs: 'ThinkPad T14',
            status: '已出库'
          },
          {
            name: '显示器',
            no: 'DS202401010002',
            category: '显示设备',
            specs: 'Dell P2419H',
            status: '已出库'
          }
        ],
        activities: [
          {
            timestamp: '2024-03-15 10:30:00',
            content: '创建出库单',
            type: 'primary'
          },
          {
            timestamp: '2024-03-15 10:35:00',
            content: '资产管理员张三审核通过',
            type: 'success'
          },
          {
            timestamp: '2024-03-15 11:00:00',
            content: '完成出库操作',
            type: 'success'
          }
        ]
      }
    },
    handlePrint(row) {
      this.$message.success('正在打印出库单：' + row.outNo)
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    getOutTypeTag(type) {
      const map = {
        '面对面派送': 'success',
        '上门派送': 'warning',
        '智能快递柜': 'info'
      }
      return map[type] || 'info'
    },
    getStatusTag(status) {
      const map = {
        '已完成': 'success',
        '处理中': 'warning',
        '待处理': 'info'
      }
      return map[status] || 'info'
    },
    showAssetSelection() {
      // 模拟选择资产
      this.outForm.assets.push({
        id: Date.now(),
        name: 'ThinkPad笔记本电脑',
        no: 'NB202401010001'
      })
    },
    removeAsset(asset) {
      const index = this.outForm.assets.findIndex(item => item.id === asset.id)
      if (index !== -1) {
        this.outForm.assets.splice(index, 1)
      }
    },
    submitForm() {
      this.$message.success('出库单提交成功')
      this.dialogVisible = false
    },
    nextStep() {
      if (this.activeStep < 2) {
        this.activeStep++
      }
    },
    prevStep() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    resetOutForm() {
      this.activeStep = 0
      this.outForm = {
        outType: '',
        expectedDate: '',
        recipient: '',
        phone: '',
        department: [],
        purpose: '',
        remarks: '',
        assets: []
      }
      if (this.$refs.outForm) {
        this.$refs.outForm.resetFields()
      }
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
  
  h2 {
    font-size: 24px;
    color: #303133;
    margin: 0;
    margin-bottom: 8px;
  }
  
  .header-desc {
    color: #909399;
    font-size: 14px;
  }
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
  
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-buttons {
    margin-left: auto;
  }
}

.operation-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-card {
  border-radius: 8px;
  
  .el-table {
    border-radius: 8px;
    overflow: hidden;
    
    &::before {
      display: none;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
  padding: 10px 0;
}

.storage-out-dialog {
  .out-steps {
    margin-bottom: 30px;
    padding: 20px 40px;
  }

  .form-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-size: 16px;
        font-weight: 500;
        
        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }
    }
  }

  .out-form {
    padding: 0 20px;
  }

  .empty-assets {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    
    i {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .asset-table {
    margin-top: 15px;
    
    .delete-btn {
      color: #f56c6c;
      
      &:hover {
        color: #ff4949;
      }
    }
  }

  .confirm-assets {
    margin-top: 20px;
    
    .confirm-title {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 3px solid #409EFF;
    }
  }
}

.full-width {
  width: 100%;
}

::v-deep .el-step__title {
  font-size: 14px;
}

::v-deep .el-step__icon {
  width: 34px;
  height: 34px;
}

.storage-out-detail-dialog {
  .el-descriptions {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
  }

  .detail-divider {
    display: flex;
    align-items: center;
    margin: 24px 0 16px;
    
    .divider-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-right: 12px;
      
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #DCDFE6;
        margin-left: 12px;
      }
    }
  }

  .asset-detail-table {
    margin-bottom: 20px;
  }

  .operation-timeline {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    .el-timeline-item {
      padding-bottom: 20px;
      
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
}

::v-deep .el-descriptions__label {
  background-color: #f5f7fa;
  color: #606266;
}

::v-deep .el-descriptions__content {
  color: #303133;
}
</style> 