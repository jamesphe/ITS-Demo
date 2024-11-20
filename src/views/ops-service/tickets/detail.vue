<template>
  <div class="app-container">
    <el-card class="ticket-detail-card">
      <div class="card-header">
        <div class="header-left">
          <span class="header-title">工单详情</span>
          <el-tag class="ticket-id">{{ ticketDetail.ticketId }}</el-tag>
        </div>
        <div class="header-right">
          <el-button-group v-if="showStatusActions" class="status-actions">
            <el-button 
              type="success" 
              size="small"
              v-if="canResolve"
              @click="handleStatusChange('已解决')">
              <i class="el-icon-check"></i>标记已解决
            </el-button>
            <el-button 
              type="info" 
              size="small"
              v-if="canClose"
              @click="handleStatusChange('已关闭')">
              <i class="el-icon-close"></i>关闭工单
            </el-button>
          </el-button-group>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </div>

      <div class="ticket-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单标题">
            {{ ticketDetail.title }}
          </el-descriptions-item>
          <el-descriptions-item label="服务名称">
            <el-tag type="info" effect="plain">
              {{ ticketDetail.serviceName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工单状态">
            <el-tag :type="getStatusType(ticketDetail.status)">
              {{ ticketDetail.status }}
            </el-tag>
            <el-button 
              type="text" 
              class="history-link"
              @click="showStatusHistory">
              查看变更历史
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(ticketDetail.priority)">
              {{ ticketDetail.priority }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ ticketDetail.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="关联事件">
            <el-link 
              type="primary" 
              @click="viewEvent(ticketDetail.eventId)"
              v-if="ticketDetail.eventId">
              {{ ticketDetail.eventId }}
            </el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户评分" v-if="showRating">
            <div class="rating-info">
              <el-rate
                v-model="ticketDetail.rating"
                :colors="ratingColors"
                :disabled="true"
                show-score
                text-color="#ff9900"
                score-template="{value}分">
              </el-rate>
              <el-popover
                placement="top-start"
                width="300"
                trigger="hover"
                v-if="ticketDetail.ratingComment">
                <div class="rating-comment">
                  <div class="comment-title">评价说明：</div>
                  <div class="comment-content">{{ ticketDetail.ratingComment }}</div>
                  <div class="rating-time">评价时间：{{ ticketDetail.ratingTime }}</div>
                </div>
                <i class="el-icon-chat-dot-square rating-icon" slot="reference"></i>
              </el-popover>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="description-section">
          <div class="section-title">工单描述</div>
          <div class="description-content">
            {{ ticketDetail.description }}
          </div>
        </div>

        <div class="attachments-section" v-if="ticketDetail.attachments?.length">
          <div class="section-title">附件</div>
          <div class="attachments-list">
            <div v-for="(file, index) in ticketDetail.attachments" 
              :key="index" 
              class="attachment-item">
              <i class="el-icon-document" />
              <span class="file-name">{{ file.name }}</span>
              <el-button type="text" @click="downloadFile(file)">下载</el-button>
            </div>
          </div>
        </div>

        <div class="rating-section" v-if="showRating">
          <div class="section-title">客户评价</div>
          <div class="rating-content">
            <div class="rating-header">
              <div class="rating-score">
                <el-rate
                  v-model="ticketDetail.rating"
                  :colors="ratingColors"
                  :disabled="true"
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分">
                </el-rate>
              </div>
              <div class="rating-time">{{ ticketDetail.ratingTime }}</div>
            </div>
            <div class="rating-text" v-if="ticketDetail.ratingComment">
              {{ ticketDetail.ratingComment }}
            </div>
            <div class="rating-tags" v-if="ticketDetail.ratingTags && ticketDetail.ratingTags.length">
              <el-tag
                v-for="tag in ticketDetail.ratingTags"
                :key="tag"
                size="small"
                effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="statusDialog.visible"
      width="500px">
      <el-form :model="statusDialog.form" label-width="80px">
        <el-form-item label="变更说明" required>
          <el-input
            type="textarea"
            v-model="statusDialog.form.comment"
            :rows="4"
            placeholder="请输入状态变更说明..."/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="statusDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmStatusChange">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="状态变更历史"
      :visible.sync="historyDialog.visible"
      width="600px">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in historyDialog.list"
          :key="index"
          :timestamp="item.time"
          :type="getTimelineItemType(item.status)">
          <div class="timeline-content">
            <div class="status-change">
              {{ item.fromStatus }} <i class="el-icon-arrow-right"></i> {{ item.status }}
            </div>
            <div class="operator">操作人：{{ item.operator }}</div>
            <div class="comment">{{ item.comment }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TicketDetail',
  data() {
    return {
      ticketDetail: {},
      // 模拟工单数据列表
      mockTickets: [
        {
          ticketId: 'W001',
          title: '系统访问异常处理工单',
          status: '未分派',
          priority: '高',
          submitTime: '2024-11-18 10:30',
          eventId: 'EVT-001',
          serviceName: '系统访问服务',
          description: '系统登录时出现异常，无法正常访问系统，需要紧急处理。',
          attachments: [
            { name: '错误截图1.png', url: '/path/to/file1' }
          ]
        },
        {
          ticketId: 'W002',
          title: '网络连接问题处理工单',
          status: '处理中',
          priority: '中',
          submitTime: '2024-11-17 14:30',
          eventId: 'EVT-002',
          serviceName: '网络连接服务',
          description: '办公区域网络连接不稳定，影响正常办公。',
          attachments: [
            { name: '网络诊断报告.pdf', url: '/path/to/file2' }
          ]
        },
        {
          ticketId: 'W003',
          title: '软件安装协助工单',
          status: '已解决',
          priority: '低',
          submitTime: '2024-11-16 11:20',
          eventId: 'EVT-003',
          serviceName: '软件安装服务',
          description: '需要安装开发环境相关软件。',
          attachments: [],
          rating: 5,
          ratingComment: '安装很快，讲解很细致，非常满意！',
          ratingTime: '2024-11-16 15:30:00',
          ratingTags: ['响应及时', '讲解细致', '服务周到']
        },
        {
          ticketId: 'W004',
          title: '账号权限申请工单',
          status: '已关闭',
          priority: '中',
          submitTime: '2024-11-15 09:15',
          eventId: 'EVT-004',
          serviceName: '账号管理服务',
          description: '需要申请测试环境的管理员权限。',
          attachments: [
            { name: '权限申请表.pdf', url: '/path/to/file3' }
          ],
          rating: 4,
          ratingComment: '处理比较及时，但是权限配置有一点小问题，后来又修改了一次。',
          ratingTime: '2024-11-15 14:20:00',
          ratingTags: ['态度好', '最终解决']
        }
      ],
      statusDialog: {
        visible: false,
        form: {
          comment: '',
          targetStatus: ''
        }
      },
      historyDialog: {
        visible: false,
        list: []
      },
      ratingColors: ['#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#67C23A']
    }
  },
  computed: {
    showStatusActions() {
      return ['处理中', '已解决'].includes(this.ticketDetail.status)
    },
    canResolve() {
      return this.ticketDetail.status === '处理中'
    },
    canClose() {
      return ['处理中', '已解决'].includes(this.ticketDetail.status)
    },
    dialogTitle() {
      return `确认${this.statusDialog.form.targetStatus}？`
    },
    showRating() {
      return ['已解决', '已关闭'].includes(this.ticketDetail.status)
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '未分派': 'warning',
        '处理中': 'primary',
        '已解决': 'success',
        '已关闭': 'info'
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
    viewEvent(eventId) {
      this.$router.push(`/ops-service/events/detail/${eventId}`)
    },
    downloadFile(file) {
      console.log('下载文件:', file)
      // 实现文件下载逻辑
    },
    handleStatusChange(status) {
      this.statusDialog.form.targetStatus = status
      this.statusDialog.form.comment = ''
      this.statusDialog.visible = true
    },
    confirmStatusChange() {
      if (!this.statusDialog.form.comment) {
        this.$message.warning('请输入变更说明')
        return
      }
      
      console.log('状态变更：', {
        status: this.statusDialog.form.targetStatus,
        comment: this.statusDialog.form.comment
      })
      
      this.$message.success('状态更新成功')
      this.ticketDetail.status = this.statusDialog.form.targetStatus
      this.statusDialog.visible = false
    },
    showStatusHistory() {
      this.historyDialog.visible = true
    },
    getTimelineItemType(status) {
      const typeMap = {
        '处理中': 'primary',
        '已解决': 'success',
        '已关闭': 'info'
      }
      return typeMap[status] || 'warning'
    },
    // 获取工单详情
    getTicketDetail(ticketId) {
      // 模拟API调用，根据工单ID获取对应的工单数据
      const ticket = this.mockTickets.find(t => t.ticketId === ticketId)
      if (ticket) {
        this.ticketDetail = { ...ticket }
        // 根据工单状态获取对应的变更历史
        this.getTicketHistory(ticketId)
      } else {
        this.$message.error('未找到工单信息')
        this.goBack()
      }
    },
    // 获取工单变更历史
    getTicketHistory(ticketId) {
      // 模拟不同工单的变更历史
      const historyMap = {
        'W001': [
          {
            time: '2024-11-18 10:30:00',
            fromStatus: '-',
            status: '未分派',
            operator: '王五',
            comment: '工单创建'
          }
        ],
        'W002': [
          {
            time: '2024-11-17 14:30:00',
            fromStatus: '-',
            status: '未分派',
            operator: '张三',
            comment: '工单创建'
          },
          {
            time: '2024-11-17 15:00:00',
            fromStatus: '未分派',
            status: '处理中',
            operator: '李四',
            comment: '已分派给网络组处理'
          }
        ],
        'W003': [
          {
            time: '2024-11-16 11:20:00',
            fromStatus: '-',
            status: '未分派',
            operator: '赵六',
            comment: '工单创建'
          },
          {
            time: '2024-11-16 13:30:00',
            fromStatus: '未分派',
            status: '处理中',
            operator: '王五',
            comment: '分派给软件组处理'
          },
          {
            time: '2024-11-16 15:20:00',
            fromStatus: '处理中',
            status: '已解决',
            operator: '李四',
            comment: '软件已安装完成，并完成测试'
          }
        ],
        'W004': [
          {
            time: '2024-11-15 09:15:00',
            fromStatus: '-',
            status: '未分派',
            operator: '张三',
            comment: '工单创建'
          },
          {
            time: '2024-11-15 10:00:00',
            fromStatus: '未分派',
            status: '处理中',
            operator: '李四',
            comment: '分派给权限管理组处理'
          },
          {
            time: '2024-11-15 11:30:00',
            fromStatus: '处理中',
            status: '已解决',
            operator: '王五',
            comment: '权限已配置完成'
          },
          {
            time: '2024-11-15 14:30:00',
            fromStatus: '已解决',
            status: '已关闭',
            operator: '张三',
            comment: '确认权限可以使用，关闭工单'
          }
        ]
      }
      this.historyDialog.list = historyMap[ticketId] || []
    }
  },
  created() {
    // 获取路由参数中的工单ID
    const ticketId = this.$route.params.id
    if (ticketId) {
      this.getTicketDetail(ticketId)
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-detail-card {
  margin: 16px;

  .card-header {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-right: 16px;
      }

      .ticket-id {
        font-size: 14px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      
      .status-actions {
        margin-right: 16px;

        .el-button {
          padding: 8px 15px;
          
          i {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .ticket-info {
    padding: 24px;

    .description-section,
    .attachments-section {
      margin-top: 24px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;
      }

      .description-content {
        background: #f8f9fb;
        padding: 16px;
        border-radius: 4px;
        line-height: 1.6;
      }
    }

    .attachments-list {
      .attachment-item {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .el-icon-document {
          color: #909399;
          margin-right: 8px;
        }

        .file-name {
          flex: 1;
          margin-right: 16px;
        }
      }
    }

    .history-link {
      margin-left: 12px;
      font-size: 13px;
    }

    .rating-info {
      display: flex;
      align-items: center;
      
      .el-rate {
        margin-right: 8px;
      }

      .rating-icon {
        font-size: 16px;
        color: #909399;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
          color: #409EFF;
        }
      }
    }

    .rating-section {
      margin-top: 24px;
      background: #ffffff;
      border-radius: 8px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;
        padding-left: 12px;
        border-left: 4px solid #409EFF;
      }

      .rating-content {
        background: #f8f9fb;
        padding: 20px;
        border-radius: 4px;

        .rating-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .rating-time {
            color: #909399;
            font-size: 13px;
          }
        }

        .rating-text {
          color: #606266;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .rating-tags {
          .el-tag {
            margin-right: 8px;
            margin-bottom: 8px;
            
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
}

.timeline-content {
  padding: 8px 0;

  .status-change {
    font-weight: 500;
    margin-bottom: 8px;

    i {
      margin: 0 8px;
      color: #909399;
    }
  }

  .operator {
    font-size: 13px;
    color: #606266;
    margin-bottom: 4px;
  }

  .comment {
    color: #606266;
    line-height: 1.6;
  }
}

::v-deep .el-timeline-item__node {
  &.el-timeline-item__node--primary {
    background-color: #409EFF;
  }
  &.el-timeline-item__node--success {
    background-color: #67C23A;
  }
  &.el-timeline-item__node--warning {
    background-color: #E6A23C;
  }
  &.el-timeline-item__node--info {
    background-color: #909399;
  }
}

.rating-comment {
  padding: 12px;

  .comment-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
  }

  .comment-content {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .rating-time {
    font-size: 12px;
    color: #909399;
  }
}

::v-deep .el-rate {
  .el-rate__icon {
    font-size: 18px;
    margin-right: 4px;
  }
  
  .el-rate__text {
    font-size: 14px;
    color: #303133;
  }
}
</style> 