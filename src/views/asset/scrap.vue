<template>
  <div class="app-container">
    <h2>资产报废</h2>
    
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="资产编号">
        <el-input v-model="searchForm.assetNo" placeholder="请输入资产编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="报废状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="待审批" value="pending"></el-option>
          <el-option label="已通过" value="approved"></el-option>
          <el-option label="已驳回" value="rejected"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="success" @click="showScrapDialog">申请报废</el-button>
      </el-form-item>
    </el-form>

    <!-- 报废记录表格 -->
    <el-table :data="scrapList" border style="width: 100%">
      <el-table-column prop="assetNo" label="资产编号" width="120"></el-table-column>
      <el-table-column prop="assetName" label="资产名称" width="150"></el-table-column>
      <el-table-column prop="department" label="使用部门" width="120"></el-table-column>
      <el-table-column prop="purchaseDate" label="购置日期" width="120"></el-table-column>
      <el-table-column prop="scrapReason" label="报废原因" show-overflow-tooltip></el-table-column>
      <el-table-column prop="disposalMethod" label="处理方式" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyDate" label="申请日期" width="120"></el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="viewDetail(scope.row)">查看</el-button>
          <el-button type="text" v-if="scope.row.status === '待审批'" @click="handleApprove(scope.row)">审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      class="pagination">
    </el-pagination>

    <!-- 报废申请对话框 -->
    <el-dialog 
      title="资产报废申请" 
      :visible.sync="dialogVisible" 
      width="650px"
      :close-on-click-modal="false"
      custom-class="scrap-dialog">
      <el-steps :active="activeStep" finish-status="success" class="steps-wrapper">
        <el-step title="填写基本信息"></el-step>
        <el-step title="上传资料"></el-step>
        <el-step title="确认提交"></el-step>
      </el-steps>

      <el-form :model="scrapForm" :rules="rules" ref="scrapForm" label-width="100px" class="scrap-form">
        <div v-show="activeStep === 0">
          <div class="form-section">
            <div class="section-title">资产信息</div>
            <el-form-item label="资产编号" prop="assetNo">
              <el-input v-model="scrapForm.assetNo" placeholder="请输入资产编号" class="asset-input">
                <el-button slot="append" type="primary" @click="searchAsset">查询</el-button>
              </el-input>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资产名称">
                  <el-input v-model="scrapForm.assetName" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="使用部门">
                  <el-input v-model="scrapForm.department" disabled></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-section">
            <div class="section-title">报废信息</div>
            <el-form-item label="报废原因" prop="scrapReason">
              <el-select v-model="scrapForm.scrapReason" placeholder="请选择报废原因" class="full-width">
                <el-option label="设备损坏" value="设备损坏">
                  <span class="reason-icon">📛</span> 设备损坏
                </el-option>
                <el-option label="技术过时" value="技术过时">
                  <span class="reason-icon">⏳</span> 技术过时
                </el-option>
                <el-option label="超过使用年限" value="超过使用年限">
                  <span class="reason-icon">📅</span> 超过使用年限
                </el-option>
                <el-option label="维修成本过高" value="维修成本过高">
                  <span class="reason-icon">💰</span> 维修成本过高
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="处理方式" prop="disposalMethod">
              <el-radio-group v-model="scrapForm.disposalMethod" class="disposal-radio">
                <el-radio label="回收">
                  <i class="el-icon-refresh"></i> 回收
                </el-radio>
                <el-radio label="销毁">
                  <i class="el-icon-delete"></i> 销毁
                </el-radio>
                <el-radio label="捐赠">
                  <i class="el-icon-gift"></i> 捐赠
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="详细说明" prop="description">
              <el-input 
                type="textarea" 
                v-model="scrapForm.description" 
                rows="3" 
                placeholder="请详细描述报废原因和具体情况"
                class="description-textarea">
              </el-input>
            </el-form-item>
          </div>
        </div>

        <div v-show="activeStep === 1">
          <div class="form-section">
            <div class="section-title">资产照片与相关文档</div>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              class="upload-wrapper"
              drag>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                支持上传jpg/png格式的照片或pdf文档，单个文件不超过10MB
              </div>
            </el-upload>
          </div>
        </div>

        <div v-show="activeStep === 2">
          <div class="confirm-info">
            <div class="info-title">请确认以下报废申请信息：</div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="资产编号">{{ scrapForm.assetNo }}</el-descriptions-item>
              <el-descriptions-item label="资产名称">{{ scrapForm.assetName }}</el-descriptions-item>
              <el-descriptions-item label="使用部门">{{ scrapForm.department }}</el-descriptions-item>
              <el-descriptions-item label="报废原因">{{ scrapForm.scrapReason }}</el-descriptions-item>
              <el-descriptions-item label="处理方式">{{ scrapForm.disposalMethod }}</el-descriptions-item>
              <el-descriptions-item label="附件数量">{{ fileList.length }}个文件</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="activeStep > 0" @click="previousStep">上一步</el-button>
        <el-button 
          type="primary" 
          v-if="activeStep < 2" 
          @click="nextStep">下一步</el-button>
        <el-button 
          type="success" 
          v-if="activeStep === 2" 
          @click="submitScrap">提交申请</el-button>
      </div>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      title="报废申请详情"
      :visible.sync="detailDialogVisible"
      width="700px"
      custom-class="detail-dialog">
      <div class="detail-content">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="资产编号">{{ detailForm.assetNo }}</el-descriptions-item>
            <el-descriptions-item label="资产名称">{{ detailForm.assetName }}</el-descriptions-item>
            <el-descriptions-item label="使用部门">{{ detailForm.department }}</el-descriptions-item>
            <el-descriptions-item label="购置日期">{{ detailForm.purchaseDate }}</el-descriptions-item>
            <el-descriptions-item label="申请日期">{{ detailForm.applyDate }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(detailForm.status)">{{ detailForm.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">报废信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报废原因">{{ detailForm.scrapReason }}</el-descriptions-item>
            <el-descriptions-item label="处理方式">{{ detailForm.disposalMethod }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">{{ detailForm.description || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">附件信息</div>
          <div v-if="detailForm.fileList && detailForm.fileList.length" class="file-list">
            <div v-for="(file, index) in detailForm.fileList" :key="index" class="file-item">
              <i class="el-icon-document"></i>
              <span class="file-name">{{ file.name }}</span>
              <el-button type="text" size="small" @click="previewFile(file)">预览</el-button>
            </div>
          </div>
          <div v-else class="no-file">暂无附件</div>
        </div>

        <div v-if="detailForm.approvalInfo" class="detail-section">
          <div class="section-title">审批信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="审批人">{{ detailForm.approvalInfo.approver }}</el-descriptions-item>
            <el-descriptions-item label="审批时间">{{ detailForm.approvalInfo.approvalTime }}</el-descriptions-item>
            <el-descriptions-item label="审批结果">
              <el-tag :type="detailForm.approvalInfo.result === '通过' ? 'success' : 'danger'">
                {{ detailForm.approvalInfo.result }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审批意见">{{ detailForm.approvalInfo.comment || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetScrap',
  data() {
    return {
      searchForm: {
        assetNo: '',
        status: ''
      },
      scrapList: [
        {
          assetNo: 'ZC2024001',
          assetName: 'ThinkPad笔记本',
          department: '信息中心',
          purchaseDate: '2020-03-15',
          scrapReason: '设备损坏',
          disposalMethod: '回收',
          status: '待审批',
          applyDate: '2024-03-20'
        }
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      dialogVisible: false,
      scrapForm: {
        assetNo: '',
        assetName: '',
        department: '',
        scrapReason: '',
        description: '',
        disposalMethod: ''
      },
      rules: {
        assetNo: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],
        scrapReason: [{ required: true, message: '请选择报废原因', trigger: 'change' }],
        description: [{ required: true, message: '请输入详细说明', trigger: 'blur' }],
        disposalMethod: [{ required: true, message: '请选择处理方式', trigger: 'change' }]
      },
      fileList: [],
      activeStep: 0,
      detailDialogVisible: false,
      detailForm: {
        assetNo: '',
        assetName: '',
        department: '',
        purchaseDate: '',
        applyDate: '',
        status: '',
        scrapReason: '',
        disposalMethod: '',
        description: '',
        fileList: [],
        approvalInfo: null
      }
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
        status: ''
      }
    },
    showScrapDialog() {
      this.dialogVisible = true
      this.scrapForm = {
        assetNo: '',
        assetName: '',
        department: '',
        scrapReason: '',
        description: '',
        disposalMethod: ''
      }
    },
    getStatusType(status) {
      const statusMap = {
        '待审批': 'warning',
        '已通过': 'success',
        '已驳回': 'danger'
      }
      return statusMap[status]
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
    },
    searchAsset() {
      // 模拟查询资产信息
      if (this.scrapForm.assetNo) {
        this.scrapForm.assetName = 'ThinkPad笔记本'
        this.scrapForm.department = '信息中心'
      }
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    submitScrap() {
      this.$refs.scrapForm.validate(valid => {
        if (valid) {
          this.$message.success('报废申请提交成功')
          this.dialogVisible = false
          // 模拟添加数据到列表
          this.scrapList.unshift({
            ...this.scrapForm,
            status: '待审批',
            applyDate: new Date().toLocaleDateString()
          })
        }
      })
    },
    viewDetail(row) {
      this.detailDialogVisible = true
      // 模拟获取详细数据
      this.detailForm = {
        ...row,
        description: '设备主板已损坏，维修费用预计3000元，超过设备当前价值，建议报废处理。',
        fileList: [
          { name: '设备损坏照片1.jpg' },
          { name: '维修检测报告.pdf' }
        ],
        approvalInfo: row.status !== '待审批' ? {
          approver: '张主任',
          approvalTime: '2024-03-21 14:30:00',
          result: row.status === '已通过' ? '通过' : '驳回',
          comment: row.status === '已通过' ? 
            '同意报废处理，请按照流程进行后续处置。' : 
            '请补充设备具体故障说明和更详细的维修评估报告。'
        } : null
      }
    },
    handleApprove(row) {
      this.$confirm('确认通过该报废申请？', '提示', {
        confirmButtonText: '通过',
        cancelButtonText: '驳回',
        type: 'warning'
      }).then(() => {
        row.status = '已通过'
        this.$message.success('审批通过')
      }).catch(() => {
        row.status = '已驳回'
        this.$message.info('已驳回')
      })
    },
    nextStep() {
      if (this.activeStep === 0) {
        this.$refs.scrapForm.validate(valid => {
          if (valid) {
            this.activeStep++
          }
        })
      } else {
        this.activeStep++
      }
    },
    previousStep() {
      this.activeStep--
    },
    previewFile(file) {
      // 模拟文件预览功能
      this.$message.info(`预览文件：${file.name}`)
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}

.scrap-dialog {
  border-radius: 8px;
}

.steps-wrapper {
  margin: 0 20px 30px;
}

.form-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.asset-input {
  width: 100%;
}

.full-width {
  width: 100%;
}

.reason-icon {
  margin-right: 8px;
}

.disposal-radio {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.disposal-radio .el-radio {
  margin-right: 30px;
}

.disposal-radio i {
  margin-right: 4px;
}

.description-textarea {
  font-family: inherit;
}

.upload-wrapper {
  text-align: center;
}

.confirm-info {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}

.el-upload-dragger {
  width: 100%;
}

.el-upload__tip {
  color: #909399;
}

.detail-dialog {
  border-radius: 8px;
}

.detail-content {
  padding: 0 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.file-list {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item i {
  color: #909399;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  color: #606266;
}

.no-file {
  text-align: center;
  color: #909399;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}
</style> 