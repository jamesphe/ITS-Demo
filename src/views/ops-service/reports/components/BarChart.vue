<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default {
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
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: [],
          barWidth: '40%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }]
      }
      
      chart.setOption(option)
    }

    const updateChart = () => {
      if (!chart || !props.chartData || !props.chartData.categories) return
      
      const option = {
        xAxis: {
          data: props.chartData.categories
        },
        series: [{
          data: props.chartData.values
        }]
      }
      
      chart.setOption(option)
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