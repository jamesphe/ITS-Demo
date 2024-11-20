<template>
  <div class="app-container">
    <el-card class="ticket-form-card">
      <div class="card-header">
        <div class="header-left">
          <i class="el-icon-plus header-icon"></i>
          <span class="header-title">创建工单</span>
        </div>
        <div class="header-right">
          <el-button plain @click="cancel">
            <i class="el-icon-back"></i>返回列表
          </el-button>
        </div>
      </div>
      
      <el-form 
        ref="ticketForm" 
        :model="ticketForm" 
        :rules="rules"
        label-width="120px"
        class="ticket-form">
        
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="工单标题" prop="title">
                <el-input 
                  v-model="ticketForm.title"
                  placeholder="请输入工单标题"
                  maxlength="100"
                  show-word-limit/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="服务名称" prop="serviceName">
                <el-select 
                  v-model="ticketForm.serviceName"
                  placeholder="请选择服务名称"
                  class="form-select">
                  <el-option
                    v-for="item in serviceTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="优先级" prop="priority">
                <el-select 
                  v-model="ticketForm.priority"
                  placeholder="请选择优先级"
                  class="form-select">
                  <el-option
                    v-for="item in priorityTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    <i :class="getPriorityIcon(item.value)"></i>
                    {{ item.label }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联事件" prop="eventId">
                <el-select
                  v-model="ticketForm.eventId"
                  placeholder="请选择关联事件"
                  filterable
                  remote
                  :remote-method="searchEvents"
                  :loading="loading"
                  class="form-select">
                  <el-option
                    v-for="item in eventOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    <span style="float: left">{{ item.value }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.label }}</span>
                  </el-option>
                </el-select>
                <div class="form-tip" v-if="ticketForm.eventId">
                  <el-link type="primary" @click="viewEvent">查看事件详情</el-link>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <div class="section-title">提交人信息</div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="提交人" prop="submitter">
                <el-input 
                  v-model="ticketForm.submitter"
                  placeholder="请输入提交人姓名"
                  :disabled="true"
                  class="form-input">
                  <i slot="prefix" class="el-icon-user"></i>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="所属部门" prop="department">
                <el-input 
                  v-model="ticketForm.department"
                  placeholder="请输入所属部门"
                  :disabled="true"
                  class="form-input">
                  <i slot="prefix" class="el-icon-office-building"></i>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系方式" prop="contact">
                <el-input 
                  v-model="ticketForm.contact"
                  placeholder="请输入联系方式"
                  class="form-input">
                  <i slot="prefix" class="el-icon-phone"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <div class="section-title">工单内容</div>
          <el-form-item label="工单描述" prop="description">
            <el-input
              type="textarea"
              v-model="ticketForm.description"
              :rows="6"
              placeholder="请详细描述问题..."
              class="description-input"/>
          </el-form-item>

          <el-form-item label="附件">
            <el-upload
              class="upload-area"
              action="/api/upload"
              multiple
              :limit="5"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload">
              <el-button type="primary" plain>
                <i class="el-icon-upload2"></i>点击上传
              </el-button>
              <div slot="tip" class="el-upload__tip">
                <i class="el-icon-info"></i>
                可上传jpg/png/pdf文件，单个文件不超过10MB，最多上传5个文件
              </div>
            </el-upload>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" size="medium" @click="submitForm">
            <i class="el-icon-check"></i>提交工单
          </el-button>
          <el-button size="medium" @click="cancel">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CreateTicket',
  data() {
    return {
      ticketForm: {
        title: '',
        submitter: '',
        department: '',
        contact: '',
        serviceName: '',
        priority: '',
        description: '',
        attachments: [],
        eventId: ''
      },
      serviceTypes: [
        { value: '系统访问服务', label: '系统访问服务' },
        { value: '网络连接服务', label: '网络连接服务' },
        { value: '软件安装服务', label: '软件安装服务' },
        { value: '账号管理服务', label: '账号管理服务' },
        { value: '数据备份服务', label: '数据备份服务' }
      ],
      priorityTypes: [
        { value: '高', label: '高' },
        { value: '中', label: '中' },
        { value: '低', label: '低' }
      ],
      rules: {
        title: [
          { required: true, message: '请输入工单标题', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        submitter: [
          { required: true, message: '请输入提交人', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请输入所属部门', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        serviceName: [
          { required: true, message: '请选择服务名称', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入工单描述', trigger: 'blur' },
          { min: 10, message: '描述不能少于10个字符', trigger: 'blur' }
        ]
      },
      loading: false,
      eventOptions: []
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const userInfo = {
        name: '张三',
        department: '技术部',
        contact: '13800138000'
      }
      this.ticketForm.submitter = userInfo.name
      this.ticketForm.department = userInfo.department
      this.ticketForm.contact = userInfo.contact
    },
    submitForm() {
      this.$refs.ticketForm.validate(valid => {
        if (valid) {
          console.log('提交的工单数据:', this.ticketForm)
          this.$message.success('工单创建成功')
          this.$router.push('/ops-service/tickets')
        }
      })
    },
    cancel() {
      this.$router.push('/ops-service/tickets')
    },
    getPriorityIcon(priority) {
      const iconMap = {
        '高': 'el-icon-warning-outline text-danger',
        '中': 'el-icon-warning-outline text-warning',
        '低': 'el-icon-info text-info'
      }
      return iconMap[priority]
    },
    handleExceed() {
      this.$message.warning('最多只能上传5个文件')
    },
    beforeUpload(file) {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isValidType) {
        this.$message.error('只能上传JPG/PNG/PDF格式的文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },
    searchEvents(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.eventOptions = [
            { value: 'EVT-001', label: '系统访问异常' },
            { value: 'EVT-002', label: '网络连接中断' },
            { value: 'EVT-003', label: '服务器CPU告警' }
          ].filter(item => {
            return item.value.toLowerCase().includes(query.toLowerCase()) ||
                   item.label.toLowerCase().includes(query.toLowerCase())
          })
          this.loading = false
        }, 500)
      } else {
        this.eventOptions = []
      }
    },
    viewEvent() {
      if (this.ticketForm.eventId) {
        this.$router.push(`/ops-service/events/detail/${this.ticketForm.eventId}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-form-card {
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f8f9fb;
    border-radius: 8px 8px 0 0;
    
    .header-left {
      display: flex;
      align-items: center;

      .header-icon {
        font-size: 20px;
        margin-right: 8px;
        color: #409EFF;
      }
      
      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .ticket-form {
    padding: 32px;

    .form-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 24px;
        padding-left: 12px;
        border-left: 4px solid #409EFF;
      }

      .el-form-item {
        margin-bottom: 24px;
      }
    }

    .form-input, .form-select {
      width: 100%;
    }

    .description-input {
      font-family: inherit;
      
      ::v-deep .el-textarea__inner {
        padding: 12px;
        line-height: 1.6;
      }
    }

    .upload-area {
      .el-upload__tip {
        color: #909399;
        font-size: 13px;
        margin-top: 8px;
        
        i {
          margin-right: 4px;
          color: #E6A23C;
        }
      }
    }

    .form-actions {
      text-align: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px dashed #ebeef5;

      .el-button {
        padding: 12px 35px;
        
        i {
          margin-right: 6px;
        }
      }
    }

    .form-tip {
      margin-top: 8px;
      font-size: 13px;
    }

    ::v-deep .el-select-dropdown__item {
      padding: 0 20px;
      height: 34px;
      line-height: 34px;
    }
  }
}

// 优先级图标颜色
.text-danger {
  color: #F56C6C;
}
.text-warning {
  color: #E6A23C;
}
.text-info {
  color: #909399;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}

::v-deep .el-input.is-disabled .el-input__inner {
  background-color: #f8f9fb;
  color: #606266;
}
</style> 