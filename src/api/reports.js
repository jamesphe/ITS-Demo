// 工单状态分布数据
const mockTicketStats = [
  { value: 235, name: '待处理' },
  { value: 310, name: '处理中' },
  { value: 534, name: '已完成' },
  { value: 135, name: '已关闭' },
  { value: 148, name: '已取消' }
]

// 工单服务类型分布
const mockServiceStats = {
  categories: ['网络服务', '系统维护', '应用部署', '权限申请', '环境配置', '数据备份'],
  values: [120, 200, 150, 80, 70, 110]
}

// 工单趋势分析数据
const mockTimelineStats = {
  dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
  values: [
    {
      name: '新增工单',
      data: [30, 42, 35, 45, 38, 25, 32]
    },
    {
      name: '已完成工单',
      data: [25, 35, 30, 40, 35, 20, 28]
    },
    {
      name: '超时工单',
      data: [5, 7, 5, 5, 3, 5, 4]
    }
  ]
}

// 工单详细数据
const mockTicketDetails = {
  list: Array(50).fill().map((_, index) => {
    const totalTickets = Math.floor(Math.random() * 50 + 30) // 30-80范围的随机数
    const completedTickets = Math.floor(Math.random() * (totalTickets - 5) + 5) // 确保完成数小于总数
    const completionRate = Math.floor((completedTickets / totalTickets) * 100)

    return {
      date: `2024-03-${String(index + 1).padStart(2, '0')}`,
      totalTickets,
      completedTickets,
      avgResponseTime: Math.floor(Math.random() * 30 + 10), // 10-40分钟
      avgHandleTime: Math.floor(Math.random() * 120 + 60), // 60-180分钟
      satisfaction: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5-5.0的随机数
      completionRate,
      serviceType: ['网络服务', '系统维护', '应用部署', '权限申请', '环境配置', '数据备份'][Math.floor(Math.random() * 6)],
      priorityLevel: ['高', '中', '低'][Math.floor(Math.random() * 3)],
      overdueCount: Math.floor(Math.random() * 5), // 0-4的随机数
      firstResolveRate: Math.floor(Math.random() * 20 + 80) // 80-100的随机数
    }
  }),
  total: 50
}

// 工单统计卡片数据
const mockTicketCards = [
  { 
    title: '总工单数',
    value: '1,362',
    trend: 12.5,
    unit: '%',
    color: '#409EFF'
  },
  {
    title: '平均处理时长',
    value: '2.5h',
    trend: -5.2,
    unit: '%',
    color: '#67C23A'
  },
  {
    title: '完成率',
    value: '95.8%',
    trend: 2.1,
    unit: '%',
    color: '#E6A23C'
  },
  {
    title: '满意度',
    value: '4.8',
    trend: 0.3,
    unit: '',
    color: '#F56C6C'
  }
]

// 事件状态分布数据
const mockEventStats = [
  { value: 25, name: '待处理' },
  { value: 38, name: '处理中' },
  { value: 85, name: '已解决' },
  { value: 15, name: '已关闭' }
]

// 事件等级分布
const mockEventLevelStats = {
  categories: ['P1-紧急', 'P2-高', 'P3-中', 'P4-低'],
  values: [15, 45, 78, 120]
}

// 事件趋势分析数据
const mockEventTimelineStats = {
  dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
  values: [
    {
      name: '新增事件',
      data: [8, 12, 5, 15, 8, 5, 7]
    },
    {
      name: '已解决事件',
      data: [6, 10, 4, 12, 7, 4, 6]
    }
  ]
}

// 事件统计卡片数据
const mockEventCards = [
  {
    title: '总事件数',
    value: '163',
    trend: 8.5,
    unit: '%',
    color: '#409EFF'
  },
  {
    title: 'P1事件数',
    value: '15',
    trend: -2.1,
    unit: '%',
    color: '#F56C6C'
  },
  {
    title: '平均解决时间',
    value: '4.2h',
    trend: -10.5,
    unit: '%',
    color: '#67C23A'
  },
  {
    title: '解决率',
    value: '92.5%',
    trend: 1.8,
    unit: '%',
    color: '#E6A23C'
  }
]

// 事件详细数据
const mockEventDetails = {
  list: Array(50).fill().map((_, index) => ({
    date: `2024-03-${String(index + 1).padStart(2, '0')}`,
    eventId: `EV${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    eventLevel: ['P1-紧急', 'P2-高', 'P3-中', 'P4-低'][Math.floor(Math.random() * 4)],
    status: ['待处理', '处理中', '已解决', '已关闭'][Math.floor(Math.random() * 4)],
    title: ['网络中断', '服务器宕机', '应用故障', '数据库异常', '安全事件'][Math.floor(Math.random() * 5)],
    impactScope: ['全局影响', '部分影响', '局部影响'][Math.floor(Math.random() * 3)],
    responseTime: Math.floor(Math.random() * 30 + 5), // 5-35分钟
    resolveTime: Math.floor(Math.random() * 240 + 60), // 1-5小时
    handler: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)]
  })),
  total: 50
}

// SLA达成情况统计
const mockSlaStats = [
  { value: 425, name: '已达成' },
  { value: 35, name: '未达成' }
]

// SLA类型分布
const mockSlaTypeStats = {
  categories: ['响应时间', '解决时间', '首次解决率', '客户满意度'],
  values: [98.5, 95.2, 92.6, 96.8]
}

// SLA趋势分析数据
const mockSlaTimelineStats = {
  dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
  values: [
    {
      name: '响应时间达成率',
      data: [98.5, 97.8, 98.2, 99.1, 98.7, 98.9, 98.5]
    },
    {
      name: '解决时间达成率',
      data: [95.2, 94.8, 95.5, 96.1, 95.8, 95.2, 95.6]
    },
    {
      name: '首次解决率',
      data: [92.6, 91.8, 92.2, 93.1, 92.8, 92.5, 92.9]
    }
  ]
}

// SLA统计卡片数据
const mockSlaCards = [
  {
    title: 'SLA总达成率',
    value: '95.8%',
    trend: 1.2,
    unit: '%',
    color: '#409EFF'
  },
  {
    title: '响应时间达成率',
    value: '98.5%',
    trend: 0.5,
    unit: '%',
    color: '#67C23A'
  },
  {
    title: '解决时间达成率',
    value: '95.2%',
    trend: -0.3,
    unit: '%',
    color: '#E6A23C'
  },
  {
    title: '客户满意度',
    value: '96.8%',
    trend: 0.8,
    unit: '%',
    color: '#F56C6C'
  }
]

// SLA详细数据
const mockSlaDetails = {
  list: Array(50).fill().map((_, index) => {
    const totalCount = Math.floor(Math.random() * 50 + 100)
    const actual = Math.floor(Math.random() * 5 + 93)
    const achievedCount = Math.floor(totalCount * (actual / 100))
    const breachCount = totalCount - achievedCount

    return {
      date: `2024-03-${String(index + 1).padStart(2, '0')}`,
      slaType: ['响应时间', '解决时间', '首次解决率', '客户满意度'][Math.floor(Math.random() * 4)],
      target: '95%',
      actual: `${actual}%`,
      achievementRate: Math.floor(Math.random() * 5 + 95),
      totalCount,
      achievedCount,
      breachCount
    }
  }),
  total: 50
}

// 团队绩效统计
const mockPerformanceStats = [
  { value: 320, name: '按时完成' },
  { value: 45, name: '超时完成' },
  { value: 25, name: '待处理' }
]

// 团队成员处理量分布
const mockTeamStats = {
  categories: ['张工', '李工', '王工', '赵工', '刘工'],
  values: [156, 142, 138, 124, 115]
}

// 团队绩效趋势
const mockPerformanceTimelineStats = {
  dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
  values: [
    {
      name: '工单处理量',
      data: [32, 28, 35, 29, 33, 26, 30]
    },
    {
      name: '平均处理时长(小时)',
      data: [2.5, 2.8, 2.3, 2.6, 2.4, 2.7, 2.5]
    }
  ]
}

// 团队绩效卡片数据
const mockPerformanceCards = [
  {
    title: '团队处理总量',
    value: '675',
    trend: 8.5,
    unit: '%',
    color: '#409EFF'
  },
  {
    title: '人均工单量',
    value: '135',
    trend: 5.2,
    unit: '%',
    color: '#67C23A'
  },
  {
    title: '按时完成率',
    value: '94.6%',
    trend: 2.1,
    unit: '%',
    color: '#E6A23C'
  },
  {
    title: '平均处理时长',
    value: '2.5h',
    trend: -0.3,
    unit: 'h',
    color: '#F56C6C'
  }
]

// 团队绩效详细数据
const mockPerformanceDetails = {
  list: Array(50).fill().map((_, index) => {
    const totalTickets = Math.floor(Math.random() * 20 + 15)
    const completedOnTime = Math.floor(totalTickets * 0.9)
    const completedOvertime = totalTickets - completedOnTime

    return {
      date: `2024-03-${String(index + 1).padStart(2, '0')}`,
      handler: ['张工', '李工', '王工', '赵工', '刘工'][Math.floor(Math.random() * 5)],
      totalTickets,
      completedOnTime,
      completedOvertime,
      avgHandleTime: (Math.random() * 1 + 2).toFixed(1),
      satisfaction: (Math.random() * 0.5 + 4.5).toFixed(1),
      firstResolveRate: `${Math.floor(Math.random() * 10 + 90)}%`
    }
  }),
  total: 50
}

export function getReportData(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { reportType, pageNum, pageSize } = params
      const start = (pageNum - 1) * pageSize
      const end = start + pageSize
      
      let responseData = {}
      
      switch (reportType) {
        case 'ticket':
          responseData = {
            ticketStats: mockTicketStats,
            serviceStats: mockServiceStats,
            timelineStats: mockTimelineStats,
            cards: mockTicketCards,
            tableData: {
              list: mockTicketDetails.list.slice(start, end),
              total: mockTicketDetails.total
            }
          }
          break
        case 'event':
          responseData = {
            stats: mockEventStats,
            levelStats: mockEventLevelStats,
            timelineStats: mockEventTimelineStats,
            cards: mockEventCards,
            tableData: {
              list: mockEventDetails.list.slice(start, end),
              total: mockEventDetails.total
            }
          }
          break
        case 'sla':
          responseData = {
            stats: mockSlaStats,
            typeStats: mockSlaTypeStats,
            timelineStats: mockSlaTimelineStats,
            cards: mockSlaCards,
            tableData: {
              list: mockSlaDetails.list.slice(start, end),
              total: mockSlaDetails.total
            }
          }
          break
        case 'performance':
          responseData = {
            stats: mockPerformanceStats,
            teamStats: mockTeamStats,
            timelineStats: mockPerformanceTimelineStats,
            cards: mockPerformanceCards,
            tableData: {
              list: mockPerformanceDetails.list.slice(start, end),
              total: mockPerformanceDetails.total
            }
          }
          break
      }

      resolve({
        code: 200,
        data: responseData
      })
    }, 500)
  })
}

export function exportReport(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '导出成功'
      })
    }, 1000)
  })
} 