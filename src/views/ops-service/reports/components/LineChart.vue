<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default {
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
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: [],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: []
      }
      
      chart.setOption(option)
    }

    const updateChart = () => {
      if (!chart || !props.chartData || !props.chartData.dates || !props.chartData.values) return

      const legendData = props.chartData.values.map(item => item.name)
      const series = props.chartData.values.map(item => ({
        name: item.name,
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: item.data,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2
        }
      }))

      const option = {
        legend: {
          data: legendData
        },
        xAxis: {
          data: props.chartData.dates
        },
        series: series
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