<template>
  <div class="app-container">
    <div class="page-header">
      <h2>供应商管理</h2>
      <div class="header-desc">管理IT设备和服务供应商的相关信息</div>
    </div>
    
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入供应商名称"
            prefix-icon="el-icon-search">
          </el-input>
        </el-form-item>
        <el-form-item label="供应类型">
          <el-select v-model="searchForm.type" placeholder="请选择">
            <el-option label="硬件设备" value="hardware">
              <i class="el-icon-monitor"></i> 硬件设备
            </el-option>
            <el-option label="软件服务" value="software">
              <i class="el-icon-coin"></i> 软件服务
            </el-option>
            <el-option label="网络设备" value="network">
              <i class="el-icon-connection"></i> 网络设备
            </el-option>
            <el-option label="维修服务" value="maintenance">
              <i class="el-icon-service"></i> 维修服务
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="operation-buttons">
      <el-button type="primary" @click="handleAdd" icon="el-icon-plus" class="add-button">新增供应商</el-button>
    </div>

    <!-- 供应商列表 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%"
        :header-cell-style="tableHeaderStyle"
        @row-click="handleRowClick"
        highlight-current-row>
        <el-table-column prop="name" label="供应商名称" min-width="180">
          <template slot-scope="scope">
            <div class="supplier-name">
              <i class="el-icon-office-building"></i>
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="供应类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="medium">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="120">
          <template slot-scope="scope">
            <i class="el-icon-user"></i> {{ scope.row.contact }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150">
          <template slot-scope="scope">
            <i class="el-icon-phone"></i> {{ scope.row.phone }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮箱" width="180">
          <template slot-scope="scope">
            <i class="el-icon-message"></i> {{ scope.row.email }}
          </template>
        </el-table-column>
        <el-table-column prop="qualification" label="资质等级" width="120">
          <template slot-scope="scope">
            <el-tag 
              :type="getQualificationTagType(scope.row.qualification)"
              effect="dark">
              {{ scope.row.qualification }}级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="合作状态" width="120">
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row.status === '合作中' ? 'success' : 'info'"
              effect="plain">
              <i :class="scope.row.status === '合作中' ? 'el-icon-success' : 'el-icon-info'"></i>
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              plain
              icon="el-icon-edit"
              @click.stop="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button 
              size="mini" 
              type="success" 
              plain
              icon="el-icon-document"
              @click.stop="handleViewRecord(scope.row)">
              记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination">
      </el-pagination>
    </el-card>

    <!-- 新增/编辑供应商对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="60%"
      :close-on-click-modal="false"
      custom-class="supplier-dialog"
      @close="handleDialogClose">
      <div class="dialog-content">
        <!-- 添加步骤条 -->
        <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 35px">
          <el-step title="基本信息"></el-step>
          <el-step title="联系方式"></el-step>
          <el-step title="资质信息"></el-step>
        </el-steps>

        <el-form 
          :model="supplierForm" 
          label-width="100px"
          :rules="rules"
          ref="supplierForm"
          class="supplier-form"
          :validate-on-rule-change="false">
          
          <!-- 第一步：基本信息 -->
          <div v-show="activeStep === 0">
            <div class="step-title">
              <i class="el-icon-office-building"></i>
              <span>基本信息</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="供应商名称" prop="name">
                  <el-input 
                    v-model="supplierForm.name" 
                    placeholder="请输入供应商名称"
                    clearable>
                    <i slot="prefix" class="el-icon-office-building"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="供应类型" prop="type">
                  <el-select 
                    v-model="supplierForm.type" 
                    style="width: 100%"
                    placeholder="请选择供应类型">
                    <el-option label="硬件设备" value="hardware">
                      <i class="el-icon-monitor"></i> 硬件设备
                    </el-option>
                    <el-option label="软件服务" value="software">
                      <i class="el-icon-coin"></i> 软件服务
                    </el-option>
                    <el-option label="网络设备" value="network">
                      <i class="el-icon-connection"></i> 网络设备
                    </el-option>
                    <el-option label="维修服务" value="maintenance">
                      <i class="el-icon-service"></i> 维修服务
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="公司简介">
              <el-input 
                type="textarea" 
                v-model="supplierForm.description"
                :rows="3"
                placeholder="请简要描述公司基本情况">
              </el-input>
            </el-form-item>
          </div>

          <!-- 第二步：联系方式 -->
          <div v-show="activeStep === 1">
            <div class="step-title">
              <i class="el-icon-phone-outline"></i>
              <span>联系方式</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人" prop="contact">
                  <el-input 
                    v-model="supplierForm.contact" 
                    placeholder="请输入联系人姓名"
                    clearable>
                    <i slot="prefix" class="el-icon-user"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input 
                    v-model="supplierForm.phone" 
                    placeholder="请输入联系电话"
                    clearable>
                    <i slot="prefix" class="el-icon-phone"></i>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="电子邮箱" prop="email">
              <el-input 
                v-model="supplierForm.email" 
                placeholder="请输入电子邮箱"
                clearable>
                <i slot="prefix" class="el-icon-message"></i>
              </el-input>
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input 
                v-model="supplierForm.address" 
                placeholder="请输入详细地址"
                clearable>
                <i slot="prefix" class="el-icon-location"></i>
              </el-input>
            </el-form-item>
          </div>

          <!-- 第三步：资质信息 -->
          <div v-show="activeStep === 2">
            <div class="step-title">
              <i class="el-icon-document-checked"></i>
              <span>资质信息</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资质等级" prop="qualification">
                  <el-select 
                    v-model="supplierForm.qualification" 
                    style="width: 100%"
                    placeholder="请选择资质等级">
                    <el-option label="A级" value="A">
                      <i class="el-icon-trophy" style="color: #67C23A"></i> A级
                    </el-option>
                    <el-option label="B级" value="B">
                      <i class="el-icon-trophy" style="color: #E6A23C"></i> B级
                    </el-option>
                    <el-option label="C级" value="C">
                      <i class="el-icon-trophy" style="color: #909399"></i> C级
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="合作状态" prop="status">
                  <el-select 
                    v-model="supplierForm.status" 
                    style="width: 100%"
                    placeholder="请选择合作状态">
                    <el-option label="合作中" value="合作中">
                      <i class="el-icon-success" style="color: #67C23A"></i> 合作中
                    </el-option>
                    <el-option label="已终止" value="已终止">
                      <i class="el-icon-error" style="color: #909399"></i> 已终止
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 新增资质文件上传部分 -->
            <el-form-item label="营业执照" prop="businessLicense">
              <el-upload
                class="upload-container"
                action="#"
                :http-request="handleBusinessLicenseUpload"
                :limit="1"
                :file-list="businessLicenseList"
                :before-upload="beforeUpload">
                <el-button size="small" type="primary">
                  <i class="el-icon-upload2"></i> 上传营业执照
                </el-button>
                <div slot="tip" class="el-upload__tip">只上传jpg/png/pdf文件，且不超过10MB</div>
              </el-upload>
            </el-form-item>

            <el-form-item label="资质证书" prop="qualificationFiles">
              <el-upload
                class="upload-container"
                action="#"
                :http-request="handleQualificationUpload"
                :file-list="qualificationFileList"
                multiple
                :before-upload="beforeUpload">
                <el-button size="small" type="primary">
                  <i class="el-icon-upload2"></i> 上传资质证书
                </el-button>
                <div slot="tip" class="el-upload__tip">可上传多个资质证书文件，支持jpg/png/pdf格式</div>
              </el-upload>
            </el-form-item>

            <el-form-item label="备注说明">
              <el-input 
                type="textarea" 
                v-model="supplierForm.remarks"
                :rows="3"
                placeholder="请输入其他补充说明">
              </el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" icon="el-icon-close" v-if="activeStep === 0">取 消</el-button>
        <el-button @click="handlePrevStep" icon="el-icon-arrow-left" v-if="activeStep > 0">上一步</el-button>
        <el-button 
          type="primary" 
          @click="handleNextStep" 
          icon="el-icon-arrow-right"
          v-if="activeStep < 2">
          下一步
        </el-button>
        <el-button 
          type="success" 
          @click="handleSubmit" 
          icon="el-icon-check"
          v-if="activeStep === 2">
          提 交
        </el-button>
      </div>
    </el-dialog>

    <!-- 合作记录对话框 -->
    <el-dialog 
      title="供应商合作记录" 
      :visible.sync="recordDialogVisible" 
      width="75%"
      class="record-dialog"
      :close-on-click-modal="false">
      <div class="record-header">
        <div class="supplier-info">
          <h3><i class="el-icon-office-building"></i> {{ currentSupplier.name }}</h3>
          <div class="supplier-tags">
            <el-tag size="small" :type="getTypeTagType(currentSupplier.type)">
              {{ currentSupplier.type }}
            </el-tag>
            <el-tag 
              size="small" 
              :type="currentSupplier.status === '合作中' ? 'success' : 'info'"
              style="margin-left: 8px">
              {{ currentSupplier.status }}
            </el-tag>
          </div>
        </div>
        <div class="record-stats">
          <div class="stat-item">
            <div class="stat-label">合作年限</div>
            <div class="stat-value">3年</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">合同总额</div>
            <div class="stat-value">￥1,450,000</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">合作项目</div>
            <div class="stat-value">12个</div>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeRecordTab" class="record-tabs">
        <el-tab-pane label="合作历史" name="history">
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in cooperationRecords"
              :key="index"
              :timestamp="record.date"
              :type="record.type">
              <el-card class="record-card" shadow="hover">
                <div class="record-card-header">
                  <h4 class="record-title">
                    <i class="el-icon-document"></i>
                    {{ record.title }}
                  </h4>
                  <el-tag size="small" :type="record.type">{{ record.status || '已完成' }}</el-tag>
                </div>
                <div class="record-content">
                  <div class="record-info">
                    <p>
                      <i class="el-icon-money"></i>
                      <span class="info-label">合同金额：</span>
                      <span class="info-value">{{ record.amount }}</span>
                    </p>
                    <p>
                      <i class="el-icon-document-checked"></i>
                      <span class="info-label">项目内容：</span>
                      <span class="info-value">{{ record.content }}</span>
                    </p>
                    <p>
                      <i class="el-icon-user"></i>
                      <span class="info-label">负责人：</span>
                      <span class="info-value">{{ record.manager || '张三' }}</span>
                    </p>
                  </div>
                  <div class="record-attachments" v-if="record.attachments">
                    <div class="attachment-title">
                      <i class="el-icon-paperclip"></i> 相关附件
                    </div>
                    <div class="attachment-list">
                      <el-link 
                        v-for="(file, fileIndex) in record.attachments" 
                        :key="fileIndex"
                        type="primary"
                        :underline="false"
                        class="attachment-item">
                        <i :class="getFileIcon(file.type)"></i>
                        {{ file.name }}
                      </el-link>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        
        <el-tab-pane label="评价记录" name="evaluation">
          <div class="evaluation-list">
            <el-card v-for="(item, index) in evaluationRecords" :key="index" class="evaluation-card">
              <div class="evaluation-header">
                <div class="eval-score">
                  <el-rate
                    v-model="item.score"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}分">
                  </el-rate>
                </div>
                <div class="eval-date">{{ item.date }}</div>
              </div>
              <div class="evaluation-content">
                <p class="eval-text">{{ item.content }}</p>
                <div class="eval-tags">
                  <el-tag 
                    v-for="(tag, tagIndex) in item.tags" 
                    :key="tagIndex"
                    size="small"
                    :type="tag.type"
                    effect="plain"
                    style="margin-right: 8px">
                    {{ tag.name }}
                  </el-tag>
                </div>
              </div>
              <div class="evaluation-footer">
                <span class="eval-project">评价项目：{{ item.project }}</span>
                <span class="eval-user">评价人：{{ item.user }}</span>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SupplierManagement',
  data() {
    return {
      searchForm: {
        name: '',
        type: ''
      },
      tableData: [
        {
          name: '联想（北京）有限公司',
          type: '硬件设备',
          contact: '张经理',
          phone: '13800138000',
          email: 'contact@lenovo.com',
          qualification: 'A',
          status: '合作中'
        },
        {
          name: '华为技术有限公司',
          type: '网络设备',
          contact: '李经理',
          phone: '13900139000',
          email: 'contact@huawei.com',
          qualification: 'A',
          status: '合作中'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 2,
      dialogVisible: false,
      dialogTitle: '',
      supplierForm: {
        name: '',
        type: '',
        contact: '',
        phone: '',
        email: '',
        qualification: '',
        status: '',
        remarks: '',
        description: '',
        address: ''
      },
      recordDialogVisible: false,
      cooperationRecords: [
        {
          date: '2024-03-15',
          title: '采购教学用计算机200台',
          amount: '￥1,000,000',
          content: '采购联想台式机用于教学楼机房更新',
          type: 'primary',
          status: '执行中',
          manager: '张经理',
          attachments: [
            { name: '采购合同.pdf', type: 'pdf' },
            { name: '验收报告.docx', type: 'doc' }
          ]
        },
        {
          date: '2023-12-01',
          title: '年度维保服务合同',
          amount: '￥200,000',
          content: '提供校园网络设备年度维保服务',
          type: 'success',
          status: '已完成',
          manager: '李经理',
          attachments: [
            { name: '服务协议.pdf', type: 'pdf' },
            { name: '服务记录.xlsx', type: 'excel' }
          ]
        }
      ],
      evaluationRecords: [
        {
          date: '2024-03-20',
          score: 4.5,
          content: '设备质量良好，售后服务及时，整体表现满意。',
          project: '教学楼机房设备采购项目',
          user: '信息中心 王主任',
          tags: [
            { name: '服务及时', type: 'success' },
            { name: '质量可靠', type: 'primary' }
          ]
        },
        {
          date: '2023-12-30',
          score: 5,
          content: '维保服务专业，响应速度快，解决问题效率高。',
          project: '年度维保服务项目',
          user: '网络中心 李工程师',
          tags: [
            { name: '专业水平高', type: 'success' },
            { name: '响应迅速', type: 'primary' }
          ]
        }
      ],
      activeRecordTab: 'history',
      currentSupplier: {
        name: '联想（北京）有限公司',
        type: '硬件设备',
        status: '合作中'
      },
      // 添加表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择供应类型', trigger: 'change' }
        ],
        contact: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      },
      activeStep: 0
    }
  },
  methods: {
    handleSearch() {
      // 模拟搜索功能
      console.log('搜索条件：', this.searchForm)
    },
    handleReset() {
      this.searchForm = {
        name: '',
        type: ''
      }
    },
    handleAdd() {
      this.dialogTitle = '新增供应商'
      this.supplierForm = {
        name: '',
        type: '',
        contact: '',
        phone: '',
        email: '',
        qualification: '',
        status: '',
        remarks: '',
        description: '',
        address: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑供应商'
      this.supplierForm = { ...row }
      this.dialogVisible = true
    },
    handleViewRecord(row) {
      this.currentSupplier = row
      this.recordDialogVisible = true
    },
    handleSubmit() {
      this.$refs.supplierForm.validate((valid) => {
        if (valid) {
          this.$notify({
            title: '成功',
            message: '供应商信息保存成功',
            type: 'success'
          })
          this.dialogVisible = false
          this.activeStep = 0
        } else {
          this.$message.error('请完善必填信息')
          return false
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 添加新方法
    tableHeaderStyle() {
      return {
        'background-color': '#f5f7fa',
        'color': '#606266',
        'font-weight': 'bold'
      }
    },
    getTypeTagType(type) {
      const types = {
        'hardware': 'primary',
        'software': 'success',
        'network': 'warning',
        'maintenance': 'info'
      }
      return types[type] || 'info'
    },
    getQualificationTagType(qualification) {
      const types = {
        'A': 'success',
        'B': 'warning',
        'C': 'info'
      }
      return types[qualification] || 'info'
    },
    handleRowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    handleNextStep() {
      if (this.activeStep < 2) {
        this.activeStep++
      }
    },
    handlePrevStep() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    handleDialogClose() {
      this.activeStep = 0
      this.$refs.supplierForm.resetFields()
    },
    getFileIcon(type) {
      const icons = {
        pdf: 'el-icon-document',
        doc: 'el-icon-document-word',
        excel: 'el-icon-document-excel'
      }
      return icons[type] || 'el-icon-document'
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
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
  }
}

.operation-buttons {
  margin-bottom: 16px;
  
  .add-button {
    padding: 9px 16px;
  }
}

.table-card {
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .supplier-name {
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
      color: #409EFF;
    }
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
  padding: 10px 20px;
}

.supplier-dialog {
  .dialog-content {
    padding: 0 20px;
  }
  
  .step-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
      color: #409EFF;
    }
  }

  .supplier-form {
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
  }

  .el-select {
    .el-input {
      input {
        padding-left: 15px;
      }
    }
  }

  .dialog-footer {
    text-align: right;
    padding: 20px 0 10px;
  }
}

.record-dialog {
  .record-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 20px;

    .supplier-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }
    }

    .record-stats {
      display: flex;
      justify-content: space-around;
      background: #f5f7fa;
      padding: 15px;
      border-radius: 4px;

      .stat-item {
        text-align: center;

        .stat-label {
          color: #909399;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .stat-value {
          color: #303133;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
  }

  .record-tabs {
    padding: 0 20px;
  }

  .record-card {
    margin-bottom: 20px;

    .record-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .record-title {
        margin: 0;
        font-size: 16px;
        color: #303133;
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }
    }

    .record-content {
      .record-info {
        p {
          margin: 8px 0;
          display: flex;
          align-items: center;

          i {
            color: #409EFF;
            margin-right: 8px;
            width: 16px;
          }

          .info-label {
            color: #909399;
            margin-right: 8px;
            width: 80px;
          }

          .info-value {
            color: #606266;
          }
        }
      }

      .record-attachments {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px dashed #EBEEF5;

        .attachment-title {
          color: #909399;
          font-size: 14px;
          margin-bottom: 10px;

          i {
            margin-right: 5px;
          }
        }

        .attachment-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .attachment-item {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            background: #f5f7fa;
            border-radius: 4px;
            transition: all 0.3s;

            i {
              margin-right: 5px;
            }

            &:hover {
              background: #ecf5ff;
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  .evaluation-list {
    .evaluation-card {
      margin-bottom: 20px;

      .evaluation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .eval-date {
          color: #909399;
          font-size: 14px;
        }
      }

      .evaluation-content {
        .eval-text {
          color: #606266;
          margin-bottom: 15px;
          line-height: 1.6;
        }

        .eval-tags {
          margin-bottom: 15px;
        }
      }

      .evaluation-footer {
        display: flex;
        justify-content: space-between;
        color: #909399;
        font-size: 14px;
        padding-top: 15px;
        border-top: 1px dashed #EBEEF5;
      }
    }
  }
}

// 添加一些动画效果
.el-table {
  .el-button {
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
}

.el-card {
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,21,41,.12);
  }
}

// 表格行悬停效果
.el-table__row {
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f5f7fa !important;
  }
}

// 标签样式优化
.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

// 步骤条样式优化
.el-steps {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin: -20px -20px 20px;
}

// 选项样式优化
.el-select-dropdown__item {
  i {
    margin-right: 8px;
  }
}

// 添加表单项动画
.el-form-item {
  transition: all 0.3s ease-in-out;
  
  &:hover {
    transform: translateX(5px);
  }
}

.record-card, .evaluation-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,21,41,.12);
  }
}
</style> 