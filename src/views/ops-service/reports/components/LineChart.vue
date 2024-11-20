<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'LineChart',
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({
        dates: [],
        values: []
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
        console.log('LineChart 收到的数据:', props.chartData)

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: props.chartData.values?.map(item => item.name) || [],
            top: 10
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: props.chartData.dates || [],
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '工单数量',
              position: 'left',
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#409EFF'
                }
              },
              axisLabel: {
                formatter: '{value}'
              }
            },
            {
              type: 'value',
              name: '百分比',
              min: 80,
              max: 100,
              position: 'right',
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#67C23A'
                }
              },
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: props.chartData.values?.map((item, index) => {
            const isPercentage = item.name.includes('率') || item.name.includes('度')
            return {
              name: item.name,
              type: 'line',
              yAxisIndex: isPercentage ? 1 : 0,
              data: item.data,
              smooth: true,
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: {
                width: 3
              },
              itemStyle: {
                color: index === 0 ? '#409EFF' : index === 1 ? '#67C23A' : '#F56C6C'
              },
              label: {
                show: true,
                position: 'top',
                formatter: params => isPercentage ? params.value + '%' : params.value
              }
            }
          }) || []
        }

        chart.setOption(option, true)
      } catch (error) {
        console.error('更新图表失败:', error)
      }
    }

    // 监听数据变化
    watch(() => props.chartData, () => {
      if (chart) {
        updateChart()
      }
    }, { deep: true })

    // 监听窗口大小变化
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