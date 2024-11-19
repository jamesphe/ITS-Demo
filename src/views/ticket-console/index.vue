<template>
  <div class="ticket-console">
    <div class="console-header">
      <el-button type="primary" size="medium" icon="el-icon-plus" @click="createTicket">
        创建工单
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card stats-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-line"></i> 工单统计</span>
          </div>
          <el-row :gutter="20" class="ticket-stats">
            <el-col :span="6">
              <div class="stat-item pending">
                <div class="stat-icon">
                  <i class="el-icon-warning-outline"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">待处理工单</div>
                  <div class="stat-number">{{ stats.pending }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item processing">
                <div class="stat-icon">
                  <i class="el-icon-loading"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">处理中工单</div>
                  <div class="stat-number">{{ stats.processing }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item new">
                <div class="stat-icon">
                  <i class="el-icon-plus"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">今日新增</div>
                  <div class="stat-number">{{ stats.todayNew }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item completed">
                <div class="stat-icon">
                  <i class="el-icon-check"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-title">今日完成</div>
                  <div class="stat-number">{{ stats.todayCompleted }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-analysis"></i> 工单趋势</span>
            <el-radio-group v-model="trendTimeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="quarter">本季度</el-radio-button>
            </el-radio-group>
          </div>
          <div class="trend-chart" ref="trendChart"></div>
        </el-card>

        <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span><i class="el-icon-tickets"></i> 最新工单</span>
            <el-button style="float: right" type="text" @click="viewAllTickets">
              查看全部 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
          <el-table 
            :data="latestTickets" 
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            @row-click="handleRowClick"
          >
            <el-table-column prop="id" label="工单号" width="120" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template slot-scope="scope">
                <div class="ticket-title-cell">
                  {{ scope.row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag size="medium" :type="getTypeTagType(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag size="medium" :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"/>
            <el-table-column label="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click.stop="viewTicketDetail(scope.row.id)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-pie-chart"></i> 工单分布</span>
            <el-dropdown trigger="click" @command="handleChartTypeChange">
              <span class="el-dropdown-link">
                {{ currentChartTitle }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="type">按类型分布</el-dropdown-item>
                <el-dropdown-item command="priority">按优先级分布</el-dropdown-item>
                <el-dropdown-item command="status">按状态分布</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="distribution-chart" ref="distributionChart"></div>
        </el-card>

        <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-operation"></i> 待分配工单</span>
            <el-button style="float: right" type="text" @click="viewUnassignedTickets">
              查看全部 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
          <div class="unassigned-list">
            <div v-for="ticket in unassignedTickets" 
                 :key="ticket.id" 
                 class="ticket-item"
                 @click="viewTicketDetail(ticket.id)">
              <div class="ticket-title">{{ ticket.title }}</div>
              <div class="ticket-info">
                <span class="create-time">
                  <i class="el-icon-time"></i> {{ ticket.createTime }}
                </span>
                <el-button 
                  type="primary" 
                  size="mini" 
                  plain
                  @click.stop="assignTicket(ticket.id)">
                  分配
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-data"></i> 处理效率</span>
          </div>
          <div class="efficiency-stats">
            <div class="efficiency-item">
              <div class="label">平均响应时间</div>
              <div class="value">2.5 小时</div>
              <div class="trend up">
                <i class="el-icon-caret-top"></i> 8.5%
              </div>
            </div>
            <div class="efficiency-item">
              <div class="label">平均处理时长</div>
              <div class="value">4.8 小时</div>
              <div class="trend down">
                <i class="el-icon-caret-bottom"></i> 3.2%
              </div>
            </div>
            <div class="efficiency-item">
              <div class="label">首次解决率</div>
              <div class="value">76.5%</div>
              <div class="trend up">
                <i class="el-icon-caret-top"></i> 5.3%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'TicketConsole',
  data() {
    return {
      stats: {
        pending: 0,
        processing: 0,
        todayNew: 0,
        todayCompleted: 0
      },
      latestTickets: [],
      unassignedTickets: [],
      trendTimeRange: 'week',
      currentChartType: 'type',
      currentChartTitle: '按类型分布',
      trendChart: null,
      distributionChart: null
    }
  },
  mounted() {
    this.fetchTicketStats()
    this.fetchLatestTickets()
    this.fetchUnassignedTickets()
    this.initTrendChart()
    this.initDistributionChart()
  },
  methods: {
    createTicket() {
      this.$router.push('/ops-service/tickets/create')
    },
    viewAllTickets() {
      this.$router.push('/ops-service/tickets')
    },
    viewUnassignedTickets() {
      // 跳转到待分配工单列表，可以带上筛选条件
      this.$router.push('/ops-service/tickets?status=unassigned')
    },
    viewTicketDetail(id) {
      this.$router.push(`/ops-service/tickets/detail/${id}`)
    },
    assignTicket(id) {
      this.$router.push(`/ops-service/tickets/assign/${id}`)
    },
    getStatusType(status) {
      const types = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已完成': 'success',
        '已关闭': 'info'
      }
      return types[status] || 'info'
    },
    async fetchTicketStats() {
      // TODO: 调用后端API获取工单统计数据
      this.stats = {
        pending: 12,
        processing: 25,
        todayNew: 8,
        todayCompleted: 6
      }
    },
    async fetchLatestTickets() {
      // 模拟最新工单数据
      this.latestTickets = [
        {
          id: 'T20240315001',
          title: '图书馆自习室网络无法连接',
          type: '网络故障',
          status: '处理中',
          createTime: '2024-03-15 09:23:45'
        },
        {
          id: 'T20240315002',
          title: '教学楼多媒体设备故障',
          type: '设备故障',
          status: '待处理',
          createTime: '2024-03-15 10:15:30'
        },
        {
          id: 'T20240315003',
          title: '新进教师办公电脑软件安装',
          type: '软件安装',
          status: '已完成',
          createTime: '2024-03-15 11:05:12'
        },
        {
          id: 'T20240315004',
          title: '行政楼打印机无法使用',
          type: '设备故障',
          status: '处理中',
          createTime: '2024-03-15 13:30:00'
        },
        {
          id: 'T20240315005',
          title: '教务系统访问异常',
          type: '系统故障',
          status: '待处理',
          createTime: '2024-03-15 14:20:18'
        },
        {
          id: 'T20240315006',
          title: '实验室服务器维护',
          type: '系统维护',
          status: '已完成',
          createTime: '2024-03-15 15:45:33'
        }
      ]
    },
    async fetchUnassignedTickets() {
      this.unassignedTickets = [
        {
          id: 'T20240315002',
          title: '教学楼多媒体设备故障',
          createTime: '2024-03-15 10:15:30'
        },
        {
          id: 'T20240315005',
          title: '教务系统访问异常',
          createTime: '2024-03-15 14:20:18'
        },
        {
          id: 'T20240315007',
          title: '学生宿舍区网络卡顿',
          createTime: '2024-03-15 16:10:25'
        },
        {
          id: 'T20240315008',
          title: '会议室视频会议系统故障',
          createTime: '2024-03-15 16:30:42'
        }
      ]
    },
    initTrendChart() {
      this.trendChart = echarts.init(this.$refs.trendChart)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['新建工单', '已处理', '完成率'],
          right: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
          {
            type: 'value',
            name: '工单数量'
          },
          {
            type: 'value',
            name: '完成率',
            max: 100,
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '新建工单',
            type: 'line',
            data: [15, 12, 18, 20, 16, 10, 8]
          },
          {
            name: '已处理',
            type: 'line',
            data: [12, 10, 15, 18, 14, 9, 7]
          },
          {
            name: '完成率',
            type: 'line',
            yAxisIndex: 1,
            data: [80, 83, 83, 90, 87, 90, 87],
            lineStyle: {
              type: 'dashed'
            }
          }
        ]
      }
      this.trendChart.setOption(option)
    },
    handleChartTypeChange(type) {
      this.currentChartType = type
      const titles = {
        type: '按类型分布',
        priority: '按优先级分布',
        status: '按状态分布'
      }
      this.currentChartTitle = titles[type]
      this.updateDistributionChart()
    },
    updateDistributionChart() {
      const chartData = {
        type: [
          { value: 35, name: '网络故障' },
          { value: 25, name: '系统维护' },
          { value: 20, name: '软件安装' },
          { value: 20, name: '其他' }
        ],
        priority: [
          { value: 15, name: '紧急' },
          { value: 30, name: '高' },
          { value: 40, name: '中' },
          { value: 15, name: '低' }
        ],
        status: [
          { value: 30, name: '待处理' },
          { value: 45, name: '处理中' },
          { value: 20, name: '已完成' },
          { value: 5, name: '已关闭' }
        ]
      }

      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: chartData[this.currentChartType],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.distributionChart.setOption(option)
    },
    getTypeTagType(type) {
      const types = {
        '网络故障': 'danger',
        '系统故障': 'warning',
        '软件安装': 'success',
        '设备故障': 'info'
      }
      return types[type] || ''
    },
    handleRowClick(row) {
      this.viewTicketDetail(row.id)
    },
    initDistributionChart() {
      this.distributionChart = echarts.init(this.$refs.distributionChart)
      // 初始化时默认显示按类型分布的数据
      const chartData = {
        type: [
          { value: 35, name: '网络故障' },
          { value: 25, name: '系统维护' },
          { value: 20, name: '软件安装' },
          { value: 20, name: '其他' }
        ]
      }

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          padding: [0, 30]
        },
        series: [
          {
            name: '工单类型',
            type: 'pie',
            radius: '50%',
            data: chartData.type,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          }
        ]
      }
      
      this.distributionChart.setOption(option)
    }
  },
  watch: {
    trendTimeRange() {
      // 根据时间范围更新趋势图数据
      this.initTrendChart()
    }
  },
  beforeDestroy() {
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    if (this.distributionChart) {
      this.distributionChart.dispose()
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-console {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
  
  .console-header {
    margin-bottom: 20px;
    .el-button {
      padding: 12px 20px;
      font-size: 14px;
    }
  }
  
  .box-card {
    margin-bottom: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    i {
      margin-right: 8px;
    }
  }

  .ticket-stats {
    .stat-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: 24px;
        margin-right: 15px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stat-content {
        flex: 1;
      }

      .stat-title {
        color: #606266;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
      }

      &.pending {
        background: rgba(230, 162, 60, 0.1);
        .stat-icon {
          background: #e6a23c;
        }
        .stat-number {
          color: #e6a23c;
        }
      }

      &.processing {
        background: rgba(64, 158, 255, 0.1);
        .stat-icon {
          background: #409eff;
        }
        .stat-number {
          color: #409eff;
        }
      }

      &.new {
        background: rgba(103, 194, 58, 0.1);
        .stat-icon {
          background: #67c23a;
        }
        .stat-number {
          color: #67c23a;
        }
      }

      &.completed {
        background: rgba(144, 147, 153, 0.1);
        .stat-icon {
          background: #909399;
        }
        .stat-number {
          color: #909399;
        }
      }
    }
  }

  .unassigned-list {
    .ticket-item {
      padding: 15px;
      border-radius: 6px;
      background: #f8f9fa;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        transform: translateX(5px);
      }

      .ticket-title {
        font-size: 14px;
        margin-bottom: 8px;
        color: #303133;
        font-weight: 500;
      }

      .ticket-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .create-time {
          font-size: 12px;
          color: #909399;
          
          i {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .trend-chart {
    height: 350px;
    margin-top: 10px;
  }

  .distribution-chart {
    height: 300px;
    margin-top: 10px;
  }

  .efficiency-stats {
    padding: 20px 0;

    .efficiency-item {
      text-align: center;
      margin-bottom: 20px;
      padding: 0 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #606266;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;
      }

      .trend {
        font-size: 12px;
        
        &.up {
          color: #67c23a;
        }
        
        &.down {
          color: #f56c6c;
        }

        i {
          margin-right: 4px;
        }
      }
    }
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
    font-size: 13px;
    
    i {
      margin-left: 5px;
    }
  }

  .ticket-title-cell {
    color: #303133;
    &:hover {
      color: #409eff;
    }
  }

  ::v-deep .el-table {
    border-radius: 8px;
    
    th {
      background-color: #f5f7fa !important;
    }
    
    td {
      padding: 12px 0;
    }
    
    tr:hover {
      cursor: pointer;
    }
  }
}
</style> 