<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'PieChart',
  props: {
    chartData: {
      type: Array,
      required: true,
      default: () => []
    },
    height: {
      type: [String, Number],
      default: '100%'
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const initChart = () => {
      if (!chartRef.value) return
      
      chart = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 'center'
        },
        series: [
          {
            name: '数据分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      }
      
      chart.setOption(option)
    }

    const updateChart = () => {
      if (!chart || !props.chartData) return
      
      const option = {
        series: [{
          data: props.chartData.map(item => ({
            ...item,
            itemStyle: {
              color: getRandomColor()
            }
          }))
        }]
      }
      
      chart.setOption(option)
    }

    const getRandomColor = () => {
      const colors = [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    const handleResize = () => {
      chart && chart.resize()
    }

    watch(() => props.chartData, () => {
      updateChart()
    }, { deep: true })

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      if (chart) {
        chart.dispose()
        chart = null
      }
      window.removeEventListener('resize', handleResize)
    })

    return {
      chartRef
    }
  }
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: v-bind(height + 'px');
}
</style> 