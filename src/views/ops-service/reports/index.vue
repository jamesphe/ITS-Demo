<template>
  <div class="ops-reports">
    <el-card class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="报表类型">
          <el-select v-model="queryParams.reportType" @change="handleReportTypeChange">
            <el-option label="工单管理报表" value="ticket" />
            <el-option label="事件管理报表" value="event" />
            <el-option label="SLA达成报表" value="sla" />
            <el-option label="团队绩效报表" value="performance" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="服务类型" v-if="queryParams.reportType === 'ticket'">
          <el-select v-model="queryParams.serviceType" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="网络服务" value="network" />
            <el-option label="系统维护" value="system" />
            <el-option label="应用部署" value="deploy" />
            <el-option label="权限申请" value="permission" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件等级" v-if="queryParams.reportType === 'event'">
          <el-select v-model="queryParams.eventLevel" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="P1-紧急" value="P1" />
            <el-option label="P2-高" value="P2" />
            <el-option label="P3-中" value="P3" />
            <el-option label="P4-低" value="P4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="success" @click="handleExport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mb-4">
      <template v-if="queryParams.reportType === 'ticket'">
        <el-col :span="6" v-for="(item, index) in ticketCards" :key="index">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">{{ item.title }}</div>
            <div class="data-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="data-footer">
              <span :class="['trend', item.trend > 0 ? 'up' : 'down']">
                {{ item.trend > 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}{{ item.unit }}
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
      </template>
      
      <template v-if="queryParams.reportType === 'event'">
        <el-col :span="6" v-for="(item, index) in eventCards" :key="index">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">{{ item.title }}</div>
            <div class="data-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="data-footer">
              <span :class="['trend', item.trend > 0 ? 'up' : 'down']">
                {{ item.trend > 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}{{ item.unit }}
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
      </template>
      
      <template v-if="queryParams.reportType === 'sla'">
        <el-col :span="6" v-for="(item, index) in slaCards" :key="index">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">{{ item.title }}</div>
            <div class="data-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="data-footer">
              <span :class="['trend', item.trend > 0 ? 'up' : 'down']">
                {{ item.trend > 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}{{ item.unit }}
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
      </template>
      
      <template v-if="queryParams.reportType === 'performance'">
        <el-col :span="6" v-for="(item, index) in performanceCards" :key="index">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">{{ item.title }}</div>
            <div class="data-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="data-footer">
              <span :class="['trend', item.trend > 0 ? 'up' : 'down']">
                {{ item.trend > 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}{{ item.unit }}
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
      </template>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ chartTitle }}</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="day">按日</el-radio-button>
                <el-radio-button label="week">按周</el-radio-button>
                <el-radio-button label="month">按月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="chartContainer">
            <component 
              :is="currentChart" 
              :chart-data="chartData"
              :height="400"
              v-if="showChart"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>{{ tableTitle }}</span>
          <div class="header-right">
            <el-radio-group v-model="tableType" size="small" class="mr-4">
              <el-radio-button label="daily">按日</el-radio-button>
              <el-radio-button label="weekly">按周</el-radio-button>
              <el-radio-button label="monthly">按月</el-radio-button>
            </el-radio-group>
            <el-button type="primary" size="small" @click="handleExport">
              <i class="el-icon-download"></i> 导出数据
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="400"
      >
        <template v-if="queryParams.reportType === 'ticket'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="totalTickets" label="工单总数" width="100" />
          <el-table-column prop="completedTickets" label="已完成工单" width="100" />
          <el-table-column prop="avgResponseTime" label="平均响应时间(分钟)" width="150" />
          <el-table-column prop="avgHandleTime" label="平均处理时间(分钟)" width="150" />
          <el-table-column prop="satisfaction" label="满意度" width="100" />
          <el-table-column prop="completionRate" label="完成率">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.completionRate"
                :color="getProgressColor(scope.row.completionRate)"
              />
            </template>
          </el-table-column>
        </template>

        <template v-if="queryParams.reportType === 'event'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="eventId" label="事件编号" width="120" />
          <el-table-column prop="eventLevel" label="事件等级" width="100">
            <template #default="scope">
              <el-tag :type="getEventLevelType(scope.row.eventLevel)">
                {{ scope.row.eventLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="事件标题" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="impactScope" label="影响范围" width="120" />
          <el-table-column prop="responseTime" label="响应时间(分钟)" width="140" />
          <el-table-column prop="resolveTime" label="解决时间(分钟)" width="140" />
          <el-table-column prop="handler" label="处理人" width="100" />
        </template>

        <template v-if="queryParams.reportType === 'performance'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="handler" label="处理人" width="100" />
          <el-table-column prop="totalTickets" label="处理总量" width="100" />
          <el-table-column prop="completedOnTime" label="按时完成" width="100" />
          <el-table-column prop="completedOvertime" label="超时完成" width="100" />
          <el-table-column prop="avgHandleTime" label="平均处理时长(小时)" width="160" />
          <el-table-column prop="satisfaction" label="满意度" width="100" />
          <el-table-column prop="firstResolveRate" label="首次解决率" width="120">
            <template #default="scope">
              <el-progress
                :percentage="parseInt(scope.row.firstResolveRate)"
                :color="getProgressColor(parseInt(scope.row.firstResolveRate))"
              />
            </template>
          </el-table-column>
        </template>

        <template v-if="queryParams.reportType === 'sla'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="slaType" label="SLA类型" width="150" />
          <el-table-column prop="target" label="目标值" width="100" />
          <el-table-column prop="actual" label="实际值" width="100" />
          <el-table-column prop="achievementRate" label="达成率">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.achievementRate"
                :color="getProgressColor(scope.row.achievementRate)"
              />
            </template>
          </el-table-column>
        </template>

        <!-- 其他报表类型的表格列 -->
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="queryParams.pageSize"
          :current-page="queryParams.pageNum"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import PieChart from './components/PieChart.vue'
import BarChart from './components/BarChart.vue'
import LineChart from './components/LineChart.vue'
import { getReportData } from '@/api/reports'

export default defineComponent({
  name: 'OpsReports',
  components: {
    PieChart,
    BarChart,
    LineChart
  },
  setup() {
    const queryParams = ref({
      reportType: 'ticket',
      dateRange: [],
      serviceType: '',
      eventLevel: '',
      pageNum: 1,
      pageSize: 10
    })

    const chartType = ref('day')
    const tableType = ref('daily')
    const tableData = ref([])
    const total = ref(0)

    // 图表数据
    const chartData = ref({})
    
    // 当前显示的图表组件
    const currentChart = computed(() => {
      const chartComponents = {
        ticket: LineChart,
        event: PieChart,
        sla: LineChart,
        performance: BarChart
      }
      return chartComponents[queryParams.value.reportType]
    })

    // 添加缺失的数据引用
    const ticketCards = ref([])
    const slaCards = ref([])
    const performanceCards = ref([])
    const eventCards = ref([])

    const showChart = ref(false)
    
    const handleQuery = async () => {
      try {
        const { data } = await getReportData(queryParams.value)
        // 根据报表类型设置相应的数据
        switch (queryParams.value.reportType) {
          case 'ticket':
            if (data.timelineStats) {
              chartData.value = {
                dates: data.timelineStats.dates,
                values: data.timelineStats.values
              }
            }
            tableData.value = data.tableData.list
            total.value = data.tableData.total
            ticketCards.value = data.cards || []
            break
          case 'event':
            chartData.value = data.stats || []
            tableData.value = data.tableData.list
            total.value = data.tableData.total
            eventCards.value = data.cards || []
            break
          case 'sla':
            if (data.timelineStats) {
              chartData.value = {
                dates: data.timelineStats.dates,
                values: data.timelineStats.values
              }
            }
            tableData.value = data.tableData.list
            total.value = data.tableData.total
            slaCards.value = data.cards || []
            break
          case 'performance':
            chartData.value = {
              categories: data.teamStats?.categories || [],
              values: data.teamStats?.values || []
            }
            tableData.value = data.tableData.list
            total.value = data.tableData.total
            performanceCards.value = data.cards || []
            break
        }
        // 添加调试日志
        console.log('当前图表数据:', chartData.value)
      } catch (error) {
        console.error('获取报表数据失败:', error)
      }
    }

    const handleExport = () => {
      console.log('导出报表')
    }

    const getProgressColor = (percentage) => {
      if (percentage < 60) return '#F56C6C'
      if (percentage < 80) return '#E6A23C'
      return '#67C23A'
    }

    const handleSizeChange = (val) => {
      queryParams.value.pageSize = val
      handleQuery()
    }

    const handleCurrentChange = (val) => {
      queryParams.value.pageNum = val
      handleQuery()
    }

    const handleReportTypeChange = () => {
      queryParams.value.pageNum = 1
      handleQuery()
    }

    const chartTitle = computed(() => {
      const titles = {
        ticket: '工单趋势分析',
        event: '事件分布分析',
        sla: 'SLA达成趋势',
        performance: '团队绩效分析'
      }
      return titles[queryParams.value.reportType]
    })

    const tableTitle = computed(() => {
      const titles = {
        ticket: '工单详细数据',
        event: '事件详细数据',
        sla: 'SLA达成详情',
        performance: '团队绩效详情'
      }
      return titles[queryParams.value.reportType]
    })

    const getEventLevelType = (level) => {
      const types = {
        'P1-紧急': 'danger',
        'P2-高': 'warning',
        'P3-中': '',
        'P4-低': 'info'
      }
      return types[level] || ''
    }

    const getStatusType = (status) => {
      const types = {
        '待处理': 'info',
        '处理中': 'warning',
        '已解决': 'success',
        '已关闭': ''
      }
      return types[status] || ''
    }

    const handleResize = () => {
      // 添加 passive 标记
      window.addEventListener('resize', handleResize, { passive: true })
    }

    onMounted(() => {
      // 确保在DOM渲染完成后初始化图表
      nextTick(async () => {
        showChart.value = true
        await handleQuery()
      })
    })

    onBeforeUnmount(() => {
      // 移除事件监听器
      window.removeEventListener('resize', handleResize)
    })

    return {
      queryParams,
      chartType,
      tableType,
      tableData,
      total,
      chartData,
      currentChart,
      handleQuery,
      handleExport,
      getProgressColor,
      handleSizeChange,
      handleCurrentChange,
      handleReportTypeChange,
      chartTitle,
      tableTitle,
      getEventLevelType,
      getStatusType,
      ticketCards,
      slaCards,
      performanceCards,
      eventCards,
      showChart
    }
  }
})
</script>

<style lang="scss" scoped>
.ops-reports {
  padding: 20px;
  
  .filter-container {
    margin-bottom: 20px;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    position: relative;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-card {
    text-align: center;
    padding: 20px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }
    
    .data-header {
      color: #909399;
      font-size: 14px;
    }
    
    .data-value {
      font-size: 28px;
      font-weight: bold;
      margin: 12px 0;
    }
    
    .data-footer {
      font-size: 12px;
      
      .trend {
        margin-right: 5px;
        &.up { 
          color: #67C23A;
          &::before {
            content: '↑';
            margin-right: 2px;
          }
        }
        &.down { 
          color: #F56C6C;
          &::before {
            content: '↓';
            margin-right: 2px;
          }
        }
      }
      
      .period {
        color: #909399;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .header-right {
    display: flex;
    align-items: center;
    
    .mr-4 {
      margin-right: 16px;
    }
  }

  .el-tag {
    &.el-tag--danger {
      background-color: #fef0f0;
    }
    &.el-tag--warning {
      background-color: #fdf6ec;
    }
    &.el-tag--success {
      background-color: #f0f9eb;
    }
    &.el-tag--info {
      background-color: #f4f4f5;
    }
  }
}
</style> 