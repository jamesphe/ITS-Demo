<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'BarChart',
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({
        categories: [],
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
        console.log('BarChart 收到的数据:', props.chartData)

        // 确保数据存在
        const categories = props.chartData.categories || []
        const values = props.chartData.values || []

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['处理总量', '按时完成', '超时完成', '满意度'],
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
            data: categories,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '工单数量',
              minInterval: 1,
              position: 'left'
            },
            {
              type: 'value',
              name: '满意度',
              min: 80,
              max: 100,
              interval: 5,
              position: 'right',
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: [
            {
              name: '处理总量',
              type: 'bar',
              data: values[0] || [],
              itemStyle: {
                color: '#409EFF'
              },
              barMaxWidth: 30
            },
            {
              name: '按时完成',
              type: 'bar',
              data: values[1] || [],
              itemStyle: {
                color: '#67C23A'
              },
              barMaxWidth: 30
            },
            {
              name: '超时完成',
              type: 'bar',
              data: values[2] || [],
              itemStyle: {
                color: '#E6A23C'
              },
              barMaxWidth: 30
            },
            {
              name: '满意度',
              type: 'line',
              yAxisIndex: 1,
              data: values[3] || [],
              itemStyle: {
                color: '#F56C6C'
              },
              lineStyle: {
                width: 3
              },
              symbol: 'circle',
              symbolSize: 8,
              label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
                fontSize: 12,
                color: '#F56C6C'
              }
            }
          ]
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
      // 延迟初始化，确保容器已渲染
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