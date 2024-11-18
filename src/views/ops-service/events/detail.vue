<template>
  <div class="app-container">
    <el-card class="detail-card">
      <!-- 页头部分 -->
      <div class="page-header">
        <div class="header-content">
          <div class="left-area">
            <div class="title-area">
              <span class="page-title">事件详情</span>
              <el-tag 
                :type="getStatusType(eventDetail.status)" 
                class="status-tag"
                effect="dark">
                {{ eventDetail.status }}
              </el-tag>
              <el-tag 
                :type="getPriorityType(eventDetail.priority)" 
                class="priority-tag"
                effect="plain">
                优先级：{{ eventDetail.priority }}
              </el-tag>
            </div>
            <div class="event-id">事件编号：{{ eventDetail.eventId }}</div>
          </div>
          <div class="right-area">
            <el-button icon="el-icon-back" @click="goBack">返回</el-button>
            <el-button 
              v-if="!eventDetail.ticketInfo"
              type="primary" 
              icon="el-icon-plus"
              @click="createTicket">
              创建工单
            </el-button>
          </div>
        </div>
      </div>

      <!-- 基本信息部分 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-info section-icon"></i>
          <span class="section-title">基本信息</span>
        </div>
        
        <div class="info-content">
          <el-row :gutter="40">
            <el-col :span="8">
              <div class="info-item">
                <span class="label">事件类型：</span>
                <span class="value">{{ eventDetail.type }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">提交时间：</span>
                <span class="value">{{ eventDetail.submitTime }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">来源：</span>
                <span class="value">{{ eventDetail.source }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="40">
            <el-col :span="8">
              <div class="info-item">
                <span class="label">提交人：</span>
                <span class="value">{{ eventDetail.submitter }}</span>
              </div>
            </el-col>
            <el-col :span="16">
              <div class="info-item">
                <span class="label">联系方式：</span>
                <span class="value">{{ eventDetail.contact }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="info-item description-item">
                <span class="label">描述：</span>
                <div class="value description-content">{{ eventDetail.description }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 关联工单信息 -->
      <div v-if="eventDetail.ticketInfo" class="detail-section">
        <div class="section-header">
          <i class="el-icon-tickets section-icon"></i>
          <span class="section-title">关联工单信息</span>
        </div>
        
        <div class="info-content">
          <el-row :gutter="40">
            <el-col :span="8">
              <div class="info-item">
                <span class="label">工单编号：</span>
                <el-button 
                  type="text" 
                  class="ticket-link"
                  @click="viewTicket(eventDetail.ticketInfo.ticketId)">
                  {{ eventDetail.ticketInfo.ticketId }}
                </el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <span class="label">工单状态：</span>
                <el-tag 
                  size="medium" 
                  :type="getTicketStatusType(eventDetail.ticketInfo.status)"
                  class="ticket-status">
                  {{ eventDetail.ticketInfo.status }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EventDetail',
  data() {
    return {
      eventDetail: {
        eventId: '',
        type: '',
        submitTime: '',
        source: '',
        priority: '',
        status: '',
        submitter: '',
        contact: '',
        description: '',
        ticketInfo: null
      }
    }
  },
  created() {
    // 获取路由参数中的事件ID
    const eventId = this.$route.params.id
    // 根据ID获取事件详情
    this.getEventDetail(eventId)
  },
  methods: {
    // 获取事件详情
    getEventDetail(id) {
      // 这里应该调用API获取事件详情
      // 暂时使用模拟数据
      this.eventDetail = {
        eventId: id,
        type: '网络故障',
        submitTime: '2024-11-18 09:45',
        source: '企业邮箱',
        priority: '高',
        status: '待处理',
        submitter: '张三',
        contact: '张三的联系方式',
        description: '用户无法访问校园网络，请尽快恢复连接',
        ticketInfo: {
          ticketId: 'W001',
          status: '未分派'
        }
      }
    },
    getStatusType(status) {
      const statusMap = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已解决': 'success'
      }
      return statusMap[status] || 'info'
    },
    getPriorityType(priority) {
      const priorityMap = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return priorityMap[priority] || 'info'
    },
    getTicketStatusType(status) {
      const statusMap = {
        '未分派': 'info',
        '处理中': 'primary',
        '已完成': 'success'
      }
      return statusMap[status] || 'info'
    },
    goBack() {
      this.$router.go(-1)
    },
    createTicket() {
      this.$router.push({
        path: '/tickets/create',
        query: { eventId: this.eventDetail.eventId }
      })
    },
    viewTicket(ticketId) {
      this.$router.push(`/tickets/detail/${ticketId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-card {
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .page-header {
    margin: -20px -20px 20px;
    padding: 16px 24px;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .left-area {
        .title-area {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .page-title {
            font-size: 16px;
            font-weight: 500;
            color: #1f2f3d;
            margin-right: 16px;
          }

          .status-tag {
            margin-right: 12px;
            padding: 0 12px;
            height: 22px;
            line-height: 22px;
            font-size: 12px;
          }

          .priority-tag {
            height: 22px;
            line-height: 22px;
            font-size: 12px;
            color: #f56c6c;
          }
        }

        .event-id {
          font-size: 13px;
          color: #606266;
        }
      }

      .right-area {
        .el-button {
          margin-left: 12px;
          font-size: 13px;
          
          [class^="el-icon-"] {
            font-size: 13px;
          }
        }
      }
    }
  }

  .detail-section {
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      border-left: 4px solid #409EFF;
      padding-left: 8px;

      .section-icon {
        font-size: 16px;
        color: #409EFF;
        margin-right: 8px;
      }

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #1f2f3d;
      }
    }

    .info-content {
      .el-row {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        min-height: 32px;

        .label {
          width: 70px;
          color: #909399;
          font-size: 13px;
          line-height: 32px;
        }

        .value {
          flex: 1;
          color: #606266;
          font-size: 13px;
          line-height: 32px;
        }

        &.description-item {
          .label {
            line-height: 1.8;
          }
          
          .description-content {
            padding: 12px 16px;
            background-color: #fafafa;
            border-radius: 4px;
            line-height: 1.8;
            min-height: 80px;
            font-size: 13px;
            color: #606266;
          }
        }

        .ticket-link {
          color: #409EFF;
          font-size: 13px;
          font-weight: normal;
          padding: 0;
          height: 32px;
          line-height: 32px;
          
          &:hover {
            color: #66b1ff;
          }
        }

        .ticket-status {
          padding: 0 8px;
          height: 22px;
          line-height: 20px;
          font-size: 12px;
        }
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 1200px) {
  .detail-card {
    .info-content {
      .el-col {
        width: 100%;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style> 