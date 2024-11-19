<template>
  <div class="app-container">
    <el-card class="box-card">
      <div class="filter-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="handleDateChange"
        />
      </div>

      <!-- 知识访问统计图表 -->
      <div class="chart-container">
        <div ref="visitChart" style="height: 300px" />
      </div>

      <!-- 热门搜索关键词 -->
      <div class="keyword-container">
        <h3>热门搜索关键词</h3>
        <el-tag
          v-for="(item, index) in hotKeywords"
          :key="index"
          :type="getTagType(index)"
          style="margin: 5px"
        >
          {{ item.keyword }} ({{ item.count }})
        </el-tag>
      </div>

      <!-- 知识条目访问排行 -->
      <div class="table-container">
        <h3>知识条目访问排行</h3>
        <el-table :data="topArticles" style="width: 100%">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="visits" label="访问次数" width="120" />
          <el-table-column prop="likes" label="点赞数" width="120" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'KnowledgeAnalysis',
  data() {
    return {
      dateRange: '',
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      visitChart: null,
      hotKeywords: [
        { keyword: '系统故障', count: 156 },
        { keyword: '网络配置', count: 98 },
        { keyword: '数据备份', count: 87 },
        { keyword: '性能优化', count: 76 },
        { keyword: '安全策略', count: 65 }
      ],
      topArticles: [
        { title: '常见系统故障排查指南', category: '故障处理', visits: 2345, likes: 89 },
        { title: '网络配置最佳实践', category: '网络管理', visits: 1890, likes: 76 },
        { title: '数据库性能优化方案', category: '数据库', visits: 1678, likes: 65 },
        { title: '服务器安全加固指南', category: '安全管理', visits: 1456, likes: 58 },
        { title: '容器化部署实践', category: '部署运维', visits: 1234, likes: 45 }
      ]
    }
  },
  mounted() {
    this.initVisitChart()
  },
  methods: {
    handleDateChange() {
      this.initVisitChart()
    },
    getTagType(index) {
      const types = ['', 'success', 'info', 'warning', 'danger']
      return types[index % types.length]
    },
    initVisitChart() {
      this.visitChart = echarts.init(this.$refs.visitChart)
      const option = {
        title: {
          text: '知识库访问趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['访问量', '搜索次数']
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '访问量',
          type: 'line',
          data: [820, 932, 901, 934, 1290, 1330, 1320]
        }, {
          name: '搜索次数',
          type: 'line',
          data: [420, 532, 501, 534, 790, 830, 920]
        }]
      }
      this.visitChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 20px;
}
.chart-container {
  margin: 20px 0;
}
.keyword-container {
  margin: 20px 0;
}
.table-container {
  margin: 20px 0;
}
</style> 