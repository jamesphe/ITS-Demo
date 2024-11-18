<template>
  <div class="app-container">
    <el-card class="create-event-card">
      <div class="page-header">
        <div class="header-left">
          <el-page-header @back="handleCancel" content="新建事件" />
        </div>
      </div>
      
      <el-form 
        ref="createForm" 
        :model="createForm" 
        :rules="createRules" 
        label-width="120px"
        class="create-form">
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <div class="form-content">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="事件类型" prop="type" required>
                  <el-select 
                    v-model="createForm.type" 
                    placeholder="请选择事件类型" 
                    class="form-select">
                    <el-option
                      v-for="item in eventTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源" prop="source" required>
                  <el-select 
                    v-model="createForm.source" 
                    placeholder="请选择来源" 
                    class="form-select">
                    <el-option
                      v-for="item in sourcesTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
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
                      <template>
                        <el-tag :type="item.tagType" size="small" class="priority-tag">
                          {{ item.label }}
                        </el-tag>
                      </template>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">提交人信息</div>
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
          <div class="section-title">事件描述</div>
          <div class="form-content">
            <el-form-item prop="description" required>
              <el-input
                type="textarea"
                v-model="createForm.description"
                :rows="6"
                placeholder="请详细描述事件的具体情况，包括：&#10;1. 问题现象 &#10;2. 影响范围 &#10;3. 期望解决时间"
                class="form-textarea"/>
            </el-form-item>
          </div>
        </div>

        <div class="form-actions">
          <el-button @click="handleCancel" class="cancel-btn">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" class="submit-btn">提 交</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CreateEvent',
  data() {
    return {
      createForm: {
        type: '',
        source: '',
        priority: '',
        submitter: '',
        contact: '',
        description: ''
      },
      createRules: {
        type: [
          { required: true, message: '请选择事件类型', trigger: 'change' }
        ],
        source: [
          { required: true, message: '请选择来源', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入事件描述', trigger: 'blur' },
          { min: 5, max: 500, message: '描述长度在 5 到 500 个字符', trigger: 'blur' }
        ]
      },
      eventTypes: [
        { value: '网络故障', label: '网络故障' },
        { value: '系统崩溃', label: '系统崩溃' },
        { value: '软件安装', label: '软件安装' }
      ],
      sourcesTypes: [
        { value: '企业邮箱', label: '企业邮箱' },
        { value: '固定电话', label: '固定电话' },
        { value: '手动记录', label: '手动记录' }
      ],
      priorityOptions: [
        { value: '高', label: '高', tagType: 'danger' },
        { value: '中', label: '中', tagType: 'warning' },
        { value: '低', label: '低', tagType: 'info' }
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
  },
  methods: {
    autoFillUserInfo() {
      this.createForm.submitter = this.currentUser.name || ''
      this.createForm.contact = this.currentUser.phone || this.currentUser.email || ''
    },
    handleCancel() {
      this.$confirm('确认取消创建事件？未保存的内容将丢失', '提示', {
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
            status: '待处理',
            createTime: new Date().toISOString()
          }

          // 这里添加创建事件的API调用
          console.log('提交的表单数据：', submitData)
          this.$message.success('创建成功')
          this.$router.push('/ops-service/events')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.create-event-card {
  margin: 16px;
  
  .page-header {
    margin-bottom: 30px;
    
    ::v-deep .el-page-header__title {
      font-size: 14px;
      color: #606266;
    }
    
    ::v-deep .el-page-header__content {
      font-size: 18px;
      color: #303133;
      font-weight: bold;
    }
  }

  .form-section {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 4px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      padding: 0 0 16px;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: #ebeef5;
      }
    }

    .form-content {
      padding: 24px 0 8px;
    }
  }

  .create-form {
    padding: 0 40px;

    .el-form-item {
      margin-bottom: 24px;
      
      ::v-deep .el-form-item__label {
        font-weight: normal;
        color: #606266;
      }
    }

    .form-select,
    .form-input {
      width: 100%;
    }

    .form-textarea {
      width: 100%;
      
      ::v-deep .el-textarea__inner {
        font-family: inherit;
        padding: 12px;
      }
    }

    .priority-tag {
      width: 100%;
      text-align: center;
    }
  }

  .form-actions {
    text-align: center;
    margin-top: 40px;
    padding-bottom: 24px;

    .cancel-btn {
      margin-right: 16px;
      padding: 9px 20px;
    }

    .submit-btn {
      padding: 9px 20px;
    }
  }
}

::v-deep .el-input-group__prepend {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #909399;
  padding: 0 12px;
}
</style> 