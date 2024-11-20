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
        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">总体SLA达成率</div>
            <div class="data-progress">
              <el-progress 
                type="dashboard"
                :percentage="Math.min(Number(slaOverview.totalRate) || 0, 100)" 
                :color="getDashboardColor"
                :stroke-width="10"
                :width="150"
              >
                <template #default="{ percentage }">
                  <div class="progress-value">{{ (Number(slaOverview.totalRate) || 0).toFixed(1) }}%</div>
                  <div class="progress-label">总达成率</div>
                </template>
              </el-progress>
            </div>
            <div class="sla-details">
              <div class="detail-item">
                <span class="label">本月工单总数:</span>
                <span class="value">{{ slaOverview.totalTickets || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">达标工单数:</span>
                <span class="value success">{{ slaOverview.achievedTickets || 0 }}</span>
              </div>
            </div>
            <div class="data-footer">
              <span :class="['trend', slaOverview.trend > 0 ? 'up' : 'down']">
                {{ slaOverview.trend > 0 ? '↑' : '↓' }}{{ Math.abs(slaOverview.trend) }}%
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">教学系统可用性</div>
            <div class="data-progress">
              <el-progress 
                type="circle" 
                :percentage="Math.min(Number(slaOverview.eduSystemAvail) || 0, 100)" 
                :color="getSLAProgressColor(Number(slaOverview.eduSystemAvail) || 0, '教学系统可用性SLA')"
                :stroke-width="8"
                :width="120"
              />
            </div>
            <div class="sla-details">
              <div class="detail-item">
                <span class="label">目标值:</span>
                <span class="value">99.9%</span>
              </div>
              <div class="detail-item">
                <span class="label">故障时间:</span>
                <span class="value error">{{ slaOverview.eduSystemDowntime }}分钟</span>
              </div>
              <div class="detail-item">
                <span class="label">故障次数:</span>
                <span class="value">{{ slaOverview.eduSystemIncidents || 0 }}次</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">响应时间达标率</div>
            <div class="data-progress">
              <el-progress 
                type="circle" 
                :percentage="Math.min(Number(slaOverview.responseRate) || 0, 100)" 
                :color="getSLAProgressColor(Number(slaOverview.responseRate) || 0, '响应时间SLA')"
                :stroke-width="8"
                :width="120"
              />
            </div>
            <div class="sla-details">
              <div class="detail-item">
                <span class="label">平均响应:</span>
                <span class="value">{{ slaOverview.avgResponseTime }}分钟</span>
              </div>
              <div class="detail-item">
                <span class="label">超时工单:</span>
                <span class="value error">{{ slaOverview.responseTimeout }}次</span>
              </div>
              <div class="detail-item">
                <span class="label">紧急工单达标率:</span>
                <span :class="['value', getValueClass(slaOverview.urgentResponseRate, 95)]">
                  {{ slaOverview.urgentResponseRate }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-header">解决时间达标率</div>
            <div class="data-progress">
              <el-progress 
                type="circle" 
                :percentage="Math.min(Number(slaOverview.resolveRate) || 0, 100)" 
                :color="getSLAProgressColor(Number(slaOverview.resolveRate) || 0, '解决时间SLA')"
                :stroke-width="8"
                :width="120"
              />
            </div>
            <div class="sla-details">
              <div class="detail-item">
                <span class="label">平均解决:</span>
                <span class="value">{{ slaOverview.avgResolveTime }}小时</span>
              </div>
              <div class="detail-item">
                <span class="label">超时工单:</span>
                <span class="value error">{{ slaOverview.resolveTimeout }}次</span>
              </div>
              <div class="detail-item">
                <span class="label">首次解决率:</span>
                <span :class="['value', getValueClass(slaOverview.firstResolveRate, 85)]">
                  {{ slaOverview.firstResolveRate }}%
                </span>
              </div>
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
        <el-card class="chart-card">
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
          <div class="chart-wrapper" ref="chartWrapper">
            <component 
              :is="currentChart" 
              :chart-data="chartData"
              :height="400"
              v-if="showChart && chartWrapper"
              class="chart-component"
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
                :percentage="Number(scope.row.completionRate) || 0"
                :color="getProgressColor(Number(scope.row.completionRate) || 0)"
              />
            </template>
          </el-table-column>
        </template>

        <template v-if="queryParams.reportType === 'event'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="eventId" label="事编号" width="120" />
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
                :percentage="Number(String(scope.row.firstResolveRate).replace('%', '')) || 0"
                :color="getProgressColor(Number(String(scope.row.firstResolveRate).replace('%', '')) || 0)"
              />
            </template>
          </el-table-column>
        </template>

        <template v-if="queryParams.reportType === 'sla'">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="slaType" label="SLA类型" width="200">
            <template #default="scope">
              <el-tag 
                :type="getSLATypeTag(scope.row.slaType)"
                effect="plain"
              >
                {{ scope.row.slaType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="目标值" width="120">
            <template #default="scope">
              <span class="target-value">{{ scope.row.target }}%</span>
              <el-tooltip 
                :content="getSLATargetDescription(scope.row.slaType)" 
                placement="top"
              >
                <i class="el-icon-question ml-1" style="color: #909399;"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="actual" label="实际值" width="120">
            <template #default="scope">
              <span :class="['actual-value', getActualValueClass(scope.row)]">
                {{ scope.row.actual }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="achievementRate" label="达成率" width="200">
            <template #default="scope">
              <div class="achievement-wrapper">
                <el-progress
                  :percentage="Number(scope.row.achievementRate) > 100 ? 100 : Number(scope.row.achievementRate) || 0"
                  :color="getSLAProgressColor(Number(scope.row.achievementRate) || 0, scope.row.slaType)"
                  :format="(percentage) => (Number(scope.row.achievementRate) || 0).toFixed(1) + '%'"
                  :stroke-width="15"
                  :text-inside="true"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getSLAStatusType(scope.row.achievementRate, scope.row.slaType)"
                effect="dark"
                size="small"
              >
                {{ getSLAStatusText(scope.row.achievementRate, scope.row.slaType) }}
              </el-tag>
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

    <template v-if="queryParams.reportType === 'performance'">
      <el-row :gutter="20" class="mt-4">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>团队绩效排名</span>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="4" v-for="(item, index) in performanceRanking" :key="index">
                <div class="ranking-card">
                  <div class="ranking-header">
                    <span class="rank-num" :class="{'top-three': index < 3}">{{ index + 1 }}</span>
                    <span class="handler-name">{{ item.name }}</span>
                  </div>
                  <div class="ranking-body">
                    <div class="stat-item">
                      <span class="label">处理总量</span>
                      <span class="value">{{ item.value }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">按时完成</span>
                      <span class="value">{{ item.onTime }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">满意度</span>
                      <span class="value">{{ item.satisfaction }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </template>
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
    const chartData = ref({
      stats: [],
      dates: [],
      values: [],
      categories: []
    })
    
    // 当前显示的图表组件
    const currentChart = computed(() => {
      const chartComponents = {
        ticket: LineChart,
        event: PieChart,
        sla: LineChart,
        performance: LineChart
      }
      return chartComponents[queryParams.value.reportType]
    })

    // 添加缺失的数据引用
    const ticketCards = ref([])
    const slaCards = ref([])
    const performanceCards = ref([])
    const eventCards = ref([])

    const chartWrapper = ref(null)
    const showChart = ref(false)
    
    // 初始化 slaOverview 响应式数据
    const slaOverview = ref({
      totalRate: 0,
      trend: 0,
      totalTickets: 0,
      achievedTickets: 0,
      eduSystemAvail: 0,
      eduSystemDowntime: 0,
      eduSystemIncidents: 0,
      responseRate: 0,
      avgResponseTime: 0,
      responseTimeout: 0,
      urgentResponseRate: 0,  // 添加紧急工单达标率
      resolveRate: 0,
      avgResolveTime: 0,
      resolveTimeout: 0,
      firstResolveRate: 0     // 添加首次解决率
    })

    const handleQuery = async () => {
      try {
        const { data } = await getReportData(queryParams.value)
        // 根据报表类型设置相应的数据
        switch (queryParams.value.reportType) {
          case 'ticket':
            console.log('收到的完整数据:', data);
            if (data.timelineStats) {
              console.log('工单趋势数据:', data.timelineStats);
              chartData.value = {
                dates: data.timelineStats.dates,
                values: [
                  {
                    name: '新增工单',
                    data: data.timelineStats.values[0]?.data || []
                  },
                  {
                    name: '已完成工单',
                    data: data.timelineStats.values[1]?.data || []
                  }
                ]
              };
              console.log('设置后的 chartData:', chartData.value);
            } else {
              console.warn('未获取到工单趋势数据');
              chartData.value = {
                dates: [],
                values: []
              };
            }
            tableData.value = data.tableData?.list || [];
            total.value = data.tableData?.total || 0;
            ticketCards.value = data.cards || [];
            break;
          case 'event':
            try {
              console.log('事件数据:', data);
              // 确保 stats 存在且是数组
              if (data && data.stats && Array.isArray(data.stats)) {
                // 转换数据格式
                const eventStats = data.stats.map(item => ({
                  name: item.name || '',
                  value: Number(item.value) || 0
                }));
                
                // 设置图表数据
                chartData.value = {
                  stats: eventStats
                };
                
                // 设置表格数据
                tableData.value = data.tableData?.list || [];
                total.value = data.tableData?.total || 0;
                eventCards.value = data.cards || [];
                
                console.log('处理后的事件图表数据:', chartData.value);
              } else {
                console.warn('事件统计数据格式不正确或为空');
                // 设置默认空数据
                chartData.value = {
                  stats: []
                };
                tableData.value = [];
                total.value = 0;
                eventCards.value = [];
              }
            } catch (error) {
              console.error('处理事件据失败:', error);
              // 发生错误时设置默认值
              chartData.value = {
                stats: []
              };
              tableData.value = [];
              total.value = 0;
              eventCards.value = [];
            }
            break;
          case 'sla':
            if (data.timelineStats) {
              chartData.value = {
                dates: data.timelineStats.dates || [],
                values: data.timelineStats.values || []
              }
              // 更新 slaOverview 数据
              if (data.overview) {
                slaOverview.value = {
                  totalRate: data.overview.totalRate || 0,
                  trend: data.overview.trend || 0,
                  eduSystemAvail: data.overview.eduSystemAvail || 0,
                  eduSystemDowntime: data.overview.eduSystemDowntime || 0,
                  responseRate: data.overview.responseRate || 0,
                  avgResponseTime: data.overview.avgResponseTime || 0,
                  responseTimeout: data.overview.responseTimeout || 0,
                  resolveRate: data.overview.resolveRate || 0,
                  avgResolveTime: data.overview.avgResolveTime || 0,
                  resolveTimeout: data.overview.resolveTimeout || 0
                }
              }
            } else {
              chartData.value = {
                dates: [],
                values: []
              }
              // 重置 slaOverview 数据
              slaOverview.value = {
                totalRate: 0,
                trend: 0,
                eduSystemAvail: 0,
                eduSystemDowntime: 0,
                responseRate: 0,
                avgResponseTime: 0,
                responseTimeout: 0,
                resolveRate: 0,
                avgResolveTime: 0,
                resolveTimeout: 0
              }
            }
            tableData.value = data.tableData.list || []
            total.value = data.tableData.total || 0
            slaCards.value = data.cards || []
            break
          case 'performance':
            console.log('收到的团队绩效数据:', data);
            if (data.timelineStats) {
              chartData.value = {
                dates: data.timelineStats.dates,
                values: data.timelineStats.values
              };
              console.log('设置后的团队绩效图表数据:', chartData.value);
            } else {
              chartData.value = {
                dates: [],
                values: []
              };
            }
            tableData.value = data.tableData?.list || [];
            total.value = data.tableData?.total || 0;
            performanceCards.value = data.cards || [];
            performanceRanking.value = data.performanceRanking || [];
            break
        }
        // 添加调试日志
        console.log('当前图表数据:', chartData.value)
      } catch (error) {
        console.error('获取报表数据失败:', error)
      }
    }

    const handleExport = () => {
      console.log('导出报')
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

    const getSLAValueColor = (value, type) => {
      const thresholds = {
        '一般故障响应时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障响应时间SLA': { excellent: 95, qualified: 90 },
        '一般故障解决时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障解决时间SLA': { excellent: 95, qualified: 90 },
        '教学系统可用性SLA': { excellent: 99.9, qualified: 99.5 },
        '核心业务系统可用性SLA': { excellent: 99.99, qualified: 99.9 },
        '首次解决率SLA': { excellent: 85, qualified: 80 },
        '用户满意度SLA': { excellent: 95, qualified: 90 }
      }

      const threshold = thresholds[type] || { excellent: 95, qualified: 90 }
      
      if (value >= threshold.excellent) return '#67C23A'
      if (value >= threshold.qualified) return '#E6A23C'
      return '#F56C6C'
    }

    const getSLAProgressColor = (percentage, type) => {
      const thresholds = {
        '一般故障响应时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障响应时间SLA': { excellent: 95, qualified: 90 },
        '一般故障解决时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障解决时间SLA': { excellent: 95, qualified: 90 },
        '教学系统可用性SLA': { excellent: 99.9, qualified: 99.5 },
        '核心业务系统可用性SLA': { excellent: 99.99, qualified: 99.9 },
        '首次解决率SLA': { excellent: 85, qualified: 80 },
        '用户满意度SLA': { excellent: 95, qualified: 90 }
      }

      const threshold = thresholds[type] || { excellent: 95, qualified: 90 }
      
      if (percentage >= threshold.excellent) return '#67C23A'
      if (percentage >= threshold.qualified) return '#E6A23C'
      return '#F56C6C'
    }

    const getSLATypeTag = (type) => {
      const typeMap = {
        '一般故障响应时间SLA': 'info',
        '紧急故障响应时间SLA': 'danger',
        '一般故障解决时间SLA': 'success',
        '紧急故障解决时间SLA': 'warning',
        '教学系统可用性SLA': 'primary',
        '核心业务系统可用性SLA': 'success',
        '首次解决率SLA': 'warning',
        '用户满意度SLA': 'info'
      }
      return typeMap[type] || ''
    }

    const getActualValueClass = (row) => {
      return {
        'better-than-target': Number(row.actual) >= Number(row.target),
        'worse-than-target': Number(row.actual) < Number(row.target)
      }
    }

    const getSLAStatusType = (rate, type) => {
      const thresholds = {
        '般故障响应时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障响应时间SLA': { excellent: 95, qualified: 90 },
        '一般故障解决时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障解决时间SLA': { excellent: 95, qualified: 90 },
        '教学系统可用性SLA': { excellent: 99.9, qualified: 99.5 },
        '核心业务系统可用性SLA': { excellent: 99.99, qualified: 99.9 },
        '首次解决率SLA': { excellent: 85, qualified: 80 },
        '用户满意度SLA': { excellent: 95, qualified: 90 }
      }

      const threshold = thresholds[type] || { excellent: 95, qualified: 90 }
      
      if (rate >= threshold.excellent) return 'success'
      if (rate >= threshold.qualified) return 'warning'
      return 'danger'
    }

    const getSLAStatusText = (rate, type) => {
      const thresholds = {
        '一般故障响应时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障响应时间SLA': { excellent: 95, qualified: 90 },
        '一般故障解决时间SLA': { excellent: 90, qualified: 85 },
        '紧急故障解决时间SLA': { excellent: 95, qualified: 90 },
        '教学系统可用性SLA': { excellent: 99.9, qualified: 99.5 },
        '核心业务系统可用性SLA': { excellent: 99.99, qualified: 99.9 },
        '首次解决率SLA': { excellent: 85, qualified: 80 },
        '用户满意度SLA': { excellent: 95, qualified: 90 }
      }

      const threshold = thresholds[type] || { excellent: 95, qualified: 90 }
      
      if (rate >= threshold.excellent) return '优秀'
      if (rate >= threshold.qualified) return '达标'
      return '未达标'
    }

    const getSLATargetDescription = (type) => {
      const descriptions = {
        '一般故障响应时间SLA': '普通故障需在30分钟内响应',
        '紧急故障响应时间SLA': '紧急故障需在15分钟内响应',
        '一般故障解决时间SLA': '普通故障需在4小时内解决',
        '紧急故障解决时间SLA': '紧急故障需在2小时内解决',
        '教学系统可用性SLA': '教学相关系统在教学时间内的可用性',
        '核心业务系统可用性SLA': '教务、OA等核心系统的可用性',
        '首次解决率SLA': '工单一次性解决的比率',
        '户满意度SLA': '用户对服务的满意程度'
      }
      return descriptions[type] || '暂无说明'
    }

    const getDashboardColor = (percentage) => {
      return [
        { color: '#F56C6C', percentage: 80 },
        { color: '#E6A23C', percentage: 90 },
        { color: '#67C23A', percentage: 100 }
      ]
    }

    // 添加 getValueClass 方法
    const getValueClass = (value, threshold) => {
      const numValue = parseFloat(value) || 0;
      const numThreshold = parseFloat(threshold) || 0;

      if (numValue >= numThreshold) {
        return 'success';
      } else if (numValue >= numThreshold - 5) {
        return 'warning';
      } else {
        return 'error';
      }
    };

    onMounted(async () => {
      // 等待 DOM 更新
      await nextTick()
      // 确保容器已渲染
      if (chartWrapper.value) {
        showChart.value = true
        await handleQuery()
      }
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
      chartWrapper,
      showChart,
      getSLAValueColor,
      getSLAProgressColor,
      getSLATypeTag,
      getActualValueClass,
      getSLAStatusType,
      getSLAStatusText,
      getSLATargetDescription,
      getDashboardColor,
      slaOverview,
      getValueClass
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

  .chart-wrapper {
    width: 100%;
    min-height: 400px;
    position: relative;
    margin: 20px 0;
    
    .chart-component {
      width: 100%;
      height: 100%;
    }
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

.chart-card {
  margin-bottom: 20px;
  
  .chart-wrapper {
    width: 100%;
    height: 400px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .chart-component {
      width: 100%;
      height: 100%;
    }
  }
}

.data-card {
  .data-progress {
    margin: 15px 0;
    display: flex;
    justify-content: center;
    
    .progress-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
    }
    
    .progress-label {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }
  }

  .sla-details {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #606266;
      }
      
      .value {
        font-weight: 500;
        
        &.success {
          color: #67C23A;
        }
        
        &.warning {
          color: #E6A23C;
        }
        
        &.error {
          color: #F56C6C;
        }
      }
    }
  }

  .data-progress {
    position: relative;
    margin: 20px 0;
    
    .progress-info {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      
      .progress-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
      
      .progress-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.target-value {
  color: #606266;
  font-weight: bold;
}

.actual-value {
  font-weight: bold;
  &.better-than-target {
    color: #67C23A;
  }
  &.worse-than-target {
    color: #F56C6C;
  }
}

.achievement-wrapper {
  padding: 5px 0;
  .el-progress {
    margin-bottom: 0;
  }
}

.el-tag {
  &.el-tag--primary {
    background-color: #ecf5ff;
    border-color: #d9ecff;
    color: #409EFF;
  }
  &.el-tag--success {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67C23A;
  }
  &.el-tag--warning {
    background-color: #fdf6ec;
    border-color: #faecd8;
    color: #E6A23C;
  }
  &.el-tag--info {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }
}

.ranking-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  height: 100%;
  
  .ranking-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .rank-num {
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background-color: #909399;
      color: #fff;
      border-radius: 50%;
      margin-right: 10px;
      font-weight: bold;
      
      &.top-three {
        background-color: #409EFF;
      }
    }
    
    .handler-name {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }
  
  .ranking-body {
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .label {
        color: #909399;
      }
      
      .value {
        font-weight: bold;
        color: #303133;
      }
    }
  }
}
</style> 