<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="header-title">工单详情</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="$router.go(-1)">返回</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="18">
          <!-- 工单基本信息 -->
          <div class="ticket-info">
            <div class="ticket-header">
              <h2 class="ticket-title">{{ ticket.title }}</h2>
              <div class="ticket-meta">
                <el-tag :type="ticket.status | statusTypeFilter" size="medium">{{ ticket.status | statusFilter }}</el-tag>
                <el-tag :type="ticket.priority | priorityTypeFilter" size="medium" effect="dark" class="priority-tag">
                  {{ ticket.priority | priorityFilter }}
                </el-tag>
              </div>
            </div>
            <div class="ticket-content">
              <p class="description">{{ ticket.description }}</p>
            </div>
          </div>

          <!-- 处理记录 -->
          <div class="process-history">
            <div class="section-title">处理记录</div>
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :type="activity.type"
                :color="activity.color"
                :timestamp="activity.timestamp"
              >
                {{ activity.content }}
                <div class="operator">操作人：{{ activity.operator }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 回复区域 -->
          <div class="reply-section">
            <div class="section-title">添加回复</div>
            <el-form ref="replyForm" :model="replyForm" :rules="replyRules">
              <el-form-item prop="content">
                <el-input
                  v-model="replyForm.content"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入回复内容"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleReply">提交回复</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-col>

        <!-- 右侧信息栏 -->
        <el-col :span="6">
          <div class="ticket-sidebar">
            <div class="info-section">
              <div class="info-item">
                <span class="label">工单编号：</span>
                <span class="value">{{ ticket.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ ticket.created_at }}</span>
              </div>
              <div class="info-item">
                <span class="label">提交人：</span>
                <span class="value">{{ ticket.submitter }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系方式：</span>
                <span class="value">{{ ticket.contact }}</span>
              </div>
              <div class="info-item">
                <span class="label">处理人：</span>
                <span class="value">{{ ticket.handler || '未分派' }}</span>
              </div>
            </div>

            <div class="action-section">
              <el-button 
                v-if="ticket.status === 'unassigned'"
                type="primary" 
                class="action-button"
                @click="handleAssign"
              >
                分派工单
              </el-button>
              <el-button 
                v-if="ticket.status === 'processing'"
                type="success" 
                class="action-button"
                @click="handleComplete"
              >
                完成工单
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TicketDetail',
  filters: {
    statusFilter(status) {
      const statusMap = {
        unassigned: '未分派',
        processing: '处理中',
        completed: '已完成'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        unassigned: 'info',
        processing: 'warning',
        completed: 'success'
      }
      return statusMap[status]
    },
    priorityFilter(priority) {
      const priorityMap = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return priorityMap[priority]
    },
    priorityTypeFilter(priority) {
      const priorityMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return priorityMap[priority]
    }
  },
  data() {
    return {
      ticket: {
        id: 'W001',
        title: '无法访问共享打印机',
        status: 'processing',
        priority: 'high',
        description: '办公室的共享打印机无法连接，多次尝试重启后仍然无法解决问题。需要技术支持协助处理。',
        created_at: '2024-11-18 10:30',
        submitter: '张三',
        contact: '13800138000',
        handler: '李工'
      },
      activities: [
        {
          content: '创建工单',
          timestamp: '2024-11-18 10:30',
          operator: '张三',
          type: 'primary',
          color: '#409EFF'
        },
        {
          content: '分派工单给李工',
          timestamp: '2024-11-18 10:35',
          operator: '系统管理员',
          type: 'success',
          color: '#67C23A'
        },
        {
          content: '开始处理：正在检查网络连接和打印机驱动',
          timestamp: '2024-11-18 10:40',
          operator: '李工',
          type: 'warning',
          color: '#E6A23C'
        }
      ],
      replyForm: {
        content: ''
      },
      replyRules: {
        content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleReply() {
      this.$refs.replyForm.validate(valid => {
        if (valid) {
          // 模拟添加回复
          this.activities.push({
            content: this.replyForm.content,
            timestamp: new Date().toLocaleString(),
            operator: '当前用户',
            type: 'primary',
            color: '#409EFF'
          })
          this.replyForm.content = ''
          this.$message.success('回复已添加')
        }
      })
    },
    handleAssign() {
      this.$message.success('工单已分派')
      this.ticket.status = 'processing'
    },
    handleComplete() {
      this.$message.success('工单已完成')
      this.ticket.status = 'completed'
    }
  }
}
</script>

<style lang="scss" scoped>
.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.ticket-info {
  margin-bottom: 30px;

  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .ticket-title {
      font-size: 20px;
      color: #303133;
      margin: 0;
    }

    .ticket-meta {
      .priority-tag {
        margin-left: 10px;
      }
    }
  }

  .ticket-content {
    .description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

.process-history {
  margin-bottom: 30px;

  .operator {
    font-size: 13px;
    color: #909399;
    margin-top: 5px;
  }
}

.reply-section {
  margin-bottom: 20px;
}

.ticket-sidebar {
  background: #f9fafc;
  border-radius: 4px;
  padding: 20px;

  .info-section {
    margin-bottom: 20px;

    .info-item {
      margin-bottom: 15px;
      font-size: 14px;

      .label {
        color: #909399;
      }

      .value {
        color: #303133;
        margin-left: 5px;
      }
    }
  }

  .action-section {
    .action-button {
      width: 100%;
      margin-bottom: 10px;
    }
  }
}

.el-timeline {
  margin-top: 20px;
  padding-left: 20px;
}
</style> 