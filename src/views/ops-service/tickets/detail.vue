<template>
  <div class="app-container">
    <el-card class="ticket-detail-card">
      <div class="page-header">
        <div class="header-left">
          <el-page-header @back="goBack" :content="`工单详情 - ${ticketData.ticketId}`" />
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            v-if="ticketData.status === '未分派'"
            @click="handleAssign">
            分派工单
          </el-button>
        </div>
      </div>

      <!-- 工单基本信息 -->
      <div class="detail-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="24" class="info-content">
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">工单编号：</span>
              <span class="item-value">{{ ticketData.ticketId }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">工单状态：</span>
              <el-tag :type="getStatusType(ticketData.status)" size="medium">
                {{ ticketData.status }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">提交时间：</span>
              <span class="item-value">{{ ticketData.submitTime }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">优先级：</span>
              <el-tag :type="getPriorityType(ticketData.priority)" size="medium">
                {{ ticketData.priority }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">关联事件：</span>
              <el-link 
                type="primary" 
                @click="viewEvent(ticketData.eventId)"
                v-if="ticketData.eventId">
                {{ ticketData.eventId }}
              </el-link>
              <span v-else class="item-value">-</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <span class="item-label">工单标题：</span>
              <span class="item-value">{{ ticketData.title }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <span class="item-label">工单描述：</span>
              <div class="description-content">{{ ticketData.description }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 提交人信息 -->
      <div class="detail-section">
        <div class="section-title">提交人信息</div>
        <el-row :gutter="24" class="info-content">
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">提交人：</span>
              <span class="item-value">{{ ticketData.submitter }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="item-label">联系方式：</span>
              <span class="item-value">{{ ticketData.contact }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TicketDetail',
  data() {
    return {
      ticketData: {
        ticketId: 'W001',
        title: '系统访问异常处理工单',
        status: '未分派',
        submitTime: '2024-11-18 10:30',
        priority: '高',
        eventId: 'EVT-001',
        description: '系统无法正常访问，影响范围：全公司员工\n期望解决时间：2小时内',
        submitter: '张三',
        contact: '13800138000'
      }
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '未分派': 'warning',
        '处理中': 'primary',
        '已完成': 'success'
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
    goBack() {
      this.$router.push('/ops-service/tickets')
    },
    handleAssign() {
      this.$router.push(`/ops-service/tickets/assign/${this.ticketData.ticketId}`)
    },
    viewEvent(eventId) {
      this.$router.push(`/ops-service/events/detail/${eventId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-detail-card {
  margin: 16px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
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

  .detail-section {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 4px;
    padding: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;
    }

    .info-content {
      .info-item {
        margin-bottom: 16px;
        line-height: 32px;

        .item-label {
          color: #606266;
          margin-right: 8px;
        }

        .item-value {
          color: #303133;
        }

        .description-content {
          margin-top: 8px;
          padding: 12px 16px;
          background-color: #f8f9fb;
          border-radius: 4px;
          line-height: 1.6;
          color: #303133;
          white-space: pre-line;
        }

        .el-tag {
          font-weight: normal;
        }
      }
    }
  }
}
</style> 