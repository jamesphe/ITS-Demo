<template>
  <div class="app-container">
    <el-card class="assign-card">
      <div class="page-header">
        <div class="header-left">
          <el-page-header @back="goBack" :content="`分派工单 - ${ticketData.ticketId}`" />
        </div>
      </div>

      <!-- 工单基本信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-tickets"></i>
          工单信息
        </div>
        <el-row :gutter="24" class="info-content">
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">工单编号：</span>
              <span class="item-value">{{ ticketData.ticketId }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">优先级：</span>
              <el-tag :type="getPriorityType(ticketData.priority)" size="medium" effect="plain">
                {{ ticketData.priority }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">提交时间：</span>
              <span class="item-value">{{ ticketData.submitTime }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item title-item">
              <span class="item-label">工单标题：</span>
              <span class="item-value highlight">{{ ticketData.title }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分派表单 -->
      <el-form 
        ref="assignForm" 
        :model="assignForm" 
        :rules="assignRules"
        label-width="100px" 
        class="assign-form">
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-user"></i>
            分派信息
          </div>
          <div class="form-content">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="处理组" prop="group" required>
                  <el-select 
                    v-model="assignForm.group"
                    placeholder="请选择处理组"
                    @change="handleGroupChange"
                    class="form-select">
                    <el-option
                      v-for="item in groupOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      <i :class="item.icon" class="group-icon"></i>
                      {{ item.label }}
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="处理人" prop="handler" required>
                  <el-select 
                    v-model="assignForm.handler"
                    placeholder="请选择处理人"
                    :disabled="!assignForm.group"
                    class="form-select">
                    <el-option
                      v-for="item in handlerOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      <el-avatar :size="24" class="handler-avatar">{{ item.label.charAt(0) }}</el-avatar>
                      {{ item.label }}
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="处理说明" prop="note">
                  <el-input
                    type="textarea"
                    v-model="assignForm.note"
                    :rows="4"
                    placeholder="请输入处理说明或注意事项，如：处理优先级、特殊要求等"
                    class="form-textarea"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="form-actions">
          <el-button @click="goBack" class="cancel-btn" icon="el-icon-close">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" class="submit-btn" icon="el-icon-check">确认分派</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AssignTicket',
  data() {
    return {
      ticketData: {
        ticketId: 'W001',
        title: '系统访问异常处理工单',
        priority: '高',
        submitTime: '2024-11-18 10:30'
      },
      assignForm: {
        group: '',
        handler: '',
        note: ''
      },
      assignRules: {
        group: [
          { required: true, message: '请选择处理组', trigger: 'change' }
        ],
        handler: [
          { required: true, message: '请选择处理人', trigger: 'change' }
        ]
      },
      groupOptions: [
        { value: 'network', label: '网络组', icon: 'el-icon-connection' },
        { value: 'system', label: '系统组', icon: 'el-icon-monitor' },
        { value: 'application', label: '应用组', icon: 'el-icon-s-platform' }
      ],
      handlerOptions: []
    }
  },
  created() {
    this.getTicketInfo()
  },
  methods: {
    getPriorityType(priority) {
      const priorityMap = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return priorityMap[priority] || 'info'
    },
    getTicketInfo() {
      const ticketId = this.$route.params.id
      console.log('获取工单信息：', ticketId)
    },
    handleGroupChange(value) {
      this.assignForm.handler = ''
      // 模拟获取处理人列表
      const handlerMap = {
        network: [
          { value: 'user1', label: '张工' },
          { value: 'user2', label: '李工' }
        ],
        system: [
          { value: 'user3', label: '王工' },
          { value: 'user4', label: '赵工' }
        ],
        application: [
          { value: 'user5', label: '刘工' },
          { value: 'user6', label: '陈工' }
        ]
      }
      this.handlerOptions = handlerMap[value] || []
    },
    goBack() {
      this.$confirm('确认取消分派工单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.back()
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.assignForm.validate(valid => {
        if (valid) {
          const submitData = {
            ticketId: this.ticketData.ticketId,
            ...this.assignForm
          }
          console.log('提交分派数据：', submitData)
          this.$message.success('分派成功')
          this.goBack()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.assign-card {
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

  .info-section,
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

    .info-content {
      .info-item {
        margin-bottom: 16px;
        line-height: 32px;

        .item-label {
          display: inline-block;
          min-width: 70px;
          color: #909399;
          font-size: 14px;
          font-weight: normal;
        }

        .item-value {
          color: #303133;
          font-size: 14px;
          
          &.highlight {
            color: #409EFF;
            font-weight: 500;
          }
        }

        &.title-item {
          padding: 16px;
          background: #f8f9fb;
          border-radius: 4px;
          margin-top: 8px;
        }

        .el-tag {
          font-size: 13px;
          padding: 0 12px;
          height: 28px;
          line-height: 26px;
        }
      }
    }
  }

  .assign-form {
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

      .group-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #909399;
        width: 16px;
        display: inline-block;
        text-align: center;
      }

      .handler-avatar {
        margin-right: 8px;
        background: #409EFF;
        color: #fff;
        font-size: 14px;
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

::v-deep .el-select-dropdown {
  .el-select-dropdown__item {
    display: flex;
    align-items: center;
    height: 34px;
    line-height: 34px;
    padding: 0 12px;
    font-size: 14px;
    color: #606266;

    &.selected {
      color: #409EFF;
      font-weight: 500;
    }

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

::v-deep .el-message-box {
  .el-message-box__title {
    font-size: 16px;
    font-weight: 500;
  }

  .el-message-box__content {
    font-size: 14px;
    color: #606266;
    padding: 24px 0;
  }

  .el-message-box__btns {
    .el-button {
      font-size: 14px;
      padding: 9px 20px;
    }
  }
}
</style> 