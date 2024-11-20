<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'PieChart',
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({
        stats: []
      })
    },
    height: {
      type: Number,
      default: 400
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const initChart = () => {
      if (!chartRef.value) return

      chartRef.value.style.height = `${props.height}px`
      chartRef.value.style.width = '100%'

      if (chart) {
        chart.dispose()
        chart = null
      }

      chart = echarts.init(chartRef.value)
      updateChart()
    }

    const updateChart = () => {
      if (!chart) return

      try {
        const stats = Array.isArray(props.chartData?.stats) ? props.chartData.stats : []
        console.log('处理的数据:', stats)

        // 计算总值
        const total = stats.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              const percentage = ((params.value / total) * 100).toFixed(1)
              return `${params.name}<br/>${params.value} (${percentage}%)`
            }
          },
          legend: {
            orient: 'vertical',
            right: '5%',
            top: 'middle',
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            formatter: (name) => {
              const item = stats.find(i => i.name === name)
              if (item) {
                const percentage = ((item.value / total) * 100).toFixed(1)
                return `${name}: ${item.value} (${percentage}%)`
              }
              return name
            }
          },
          series: [
            {
              name: 'SLA达成情况',
              type: 'pie',
              radius: ['50%', '70%'],
              center: ['40%', '50%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 6,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                position: 'outside',
                formatter: (params) => {
                  const percentage = ((params.value / total) * 100).toFixed(1)
                  return `${percentage}%`
                }
              },
              labelLine: {
                show: true,
                length: 15,
                length2: 10
              },
              data: stats.map((item, index) => ({
                name: item.name || '',
                value: Number(item.value) || 0,
                itemStyle: {
                  color: getItemColor(index, item.name)
                }
              }))
            }
          ]
        }

        chart.setOption(option, true)
      } catch (error) {
        console.error('更新图表失败:', error)
        chart.setOption({
          series: [{
            type: 'pie',
            data: []
          }]
        })
      }
    }

    const getItemColor = (index, name) => {
      // 根据SLA类型设置不同的颜色
      const colorMap = {
        '已达标': '#67C23A',
        '未达标': '#F56C6C',
        '优秀': '#409EFF',
        '一般': '#E6A23C'
      }

      // 如果有匹配的名称就使用对应颜色，否则使用默认颜色数组
      if (colorMap[name]) {
        return colorMap[name]
      }

      const defaultColors = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C',
        '#909399', '#36CBCB', '#975FE5', '#FF9668'
      ]
      return defaultColors[index % defaultColors.length]
    }

    watch(() => props.chartData, () => {
      if (chart) {
        updateChart()
      }
    }, { deep: true })

    const handleResize = () => {
      if (chart) {
        chart.resize()
      }
    }

    onMounted(() => {
      setTimeout(() => {
        initChart()
        window.addEventListener('resize', handleResize)
      }, 0)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (chart) {
        chart.dispose()
        chart = null
      }
    })

    return {
      chartRef
    }
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-height: 400px;
  position: relative;
  margin: 0 auto;
}
</style> 