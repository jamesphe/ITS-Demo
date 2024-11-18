<template>
  <div class="app-container">
    <el-card class="create-ticket-card">
      <div class="page-header">
        <div class="header-left">
          <el-page-header @back="handleCancel" content="新建工单" />
        </div>
      </div>
      
      <el-form 
        ref="createForm" 
        :model="createForm" 
        :rules="createRules" 
        label-width="120px"
        class="create-form">
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-tickets"></i>
            基本信息
          </div>
          <div class="form-content">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="工单标题" prop="title" required>
                  <el-input 
                    v-model="createForm.title" 
                    placeholder="请输入工单标题"
                    class="form-input"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="优先级" prop="priority" required>
                  <el-select 
                    v-model="createForm.priority" 
                    placeholder="请选择优先级" 
                    class="form-select">
                    <el-option
                      v-for="item in priorityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      <el-tag :type="item.tagType" size="small" class="priority-tag">
                        {{ item.label }}
                      </el-tag>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="关联事件" prop="eventId">
                  <el-select 
                    v-model="createForm.eventId" 
                    placeholder="请选择关联事件" 
                    filterable
                    clearable
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
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-user"></i>
            提交人信息
          </div>
          <div class="form-content">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="提交人" prop="submitter">
                  <el-input 
                    v-model="createForm.submitter" 
                    disabled 
                    class="form-input">
                    <template slot="prepend">
                      <i class="el-icon-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系方式" prop="contact">
                  <el-input 
                    v-model="createForm.contact" 
                    disabled 
                    class="form-input">
                    <template slot="prepend">
                      <i class="el-icon-phone"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-document"></i>
            工单描述
          </div>
          <div class="form-content">
            <el-form-item prop="description" required>
              <el-input
                type="textarea"
                v-model="createForm.description"
                :rows="6"
                placeholder="请详细描述工单内容，包括：&#10;1. 问题现象 &#10;2. 影响范围 &#10;3. 期望解决时间"
                class="form-textarea"/>
            </el-form-item>
          </div>
        </div>

        <div class="form-actions">
          <el-button @click="handleCancel" class="cancel-btn" icon="el-icon-close">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" class="submit-btn" icon="el-icon-check">提 交</el-button>
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
      createForm: {
        title: '',
        priority: '',
        eventId: '',
        submitter: '',
        contact: '',
        description: ''
      },
      createRules: {
        title: [
          { required: true, message: '请输入工单标题', trigger: 'blur' },
          { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入工单描述', trigger: 'blur' },
          { min: 5, max: 500, message: '描述长度在 5 到 500 个字符', trigger: 'blur' }
        ]
      },
      priorityOptions: [
        { value: '高', label: '高', tagType: 'danger' },
        { value: '中', label: '中', tagType: 'warning' },
        { value: '低', label: '低', tagType: 'info' }
      ],
      eventOptions: [
        { value: 'EVT-001', label: '系统无法访问' },
        { value: 'EVT-002', label: '网络连接问题' },
        { value: 'EVT-003', label: '软件安装异常' }
      ]
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user.userInfo || {}
    }
  },
  created() {
    this.autoFillUserInfo()
    this.getEventId()
  },
  methods: {
    autoFillUserInfo() {
      this.createForm.submitter = this.currentUser.name || ''
      this.createForm.contact = this.currentUser.phone || this.currentUser.email || ''
    },
    getEventId() {
      // 从路由参数获取事件ID
      const eventId = this.$route.query.eventId
      if (eventId) {
        this.createForm.eventId = eventId
        // 这里可以调用API获取事件详情
      }
    },
    handleCancel() {
      this.$confirm('确认取消创建工单？未保存的内容将丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.back()
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          const submitData = {
            ...this.createForm,
            submitter: this.currentUser.name,
            submitterId: this.currentUser.id,
            contact: this.currentUser.phone || this.currentUser.email,
            status: '未分派',
            createTime: new Date().toISOString()
          }

          // 这里添加创建工单的API调用
          console.log('提交的表单数据：', submitData)
          this.$message.success('创建成功')
          this.$router.push('/ops-service/tickets')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.create-ticket-card {
  margin: 16px;
  
  .page-header {
    margin-bottom: 24px;
    
    ::v-deep .el-page-header__left {
      .el-icon-back {
        font-size: 18px;
        color: #909399;
        font-weight: normal;
      }

      .el-page-header__title {
        font-size: 14px;
        color: #909399;
        font-weight: normal;
      }
    }
    
    ::v-deep .el-page-header__content {
      font-size: 20px;
      color: #303133;
      font-weight: 500;
    }
  }

  .form-section {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 18px;
        color: #409EFF;
      }
    }

    .form-content {
      padding: 0;

      .el-form-item {
        margin-bottom: 24px;

        ::v-deep .el-form-item__label {
          font-size: 14px;
          color: #606266;
          font-weight: normal;
          line-height: 32px;
          padding-right: 12px;
        }

        ::v-deep .el-form-item__content {
          line-height: 32px;
        }
      }

      .form-input,
      .form-select {
        width: 100%;
        
        ::v-deep .el-input__inner {
          font-size: 14px;
          height: 32px;
          line-height: 32px;
        }
      }

      .form-textarea {
        width: 100%;
        
        ::v-deep .el-textarea__inner {
          padding: 12px;
          font-size: 14px;
          line-height: 1.5;
          font-family: inherit;
          color: #303133;

          &::placeholder {
            color: #909399;
            font-size: 14px;
          }
        }
      }

      .priority-tag {
        width: 100%;
        text-align: center;
      }
    }
  }

  .form-actions {
    text-align: center;
    margin-top: 40px;
    padding-bottom: 16px;

    .cancel-btn,
    .submit-btn {
      padding: 9px 20px;
      font-size: 14px;
      border-radius: 4px;

      [class^="el-icon-"] {
        margin-right: 6px;
        font-size: 14px;
      }
    }

    .cancel-btn {
      margin-right: 16px;
    }
  }
}

::v-deep .el-input-group__prepend {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #909399;
  padding: 0 12px;
}

::v-deep .el-select-dropdown__item {
  height: 34px;
  line-height: 34px;
  padding: 0 12px;
  font-size: 14px;
}
</style> 