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
    const totalTickets = Math.floor(Math.random() * 50 + 30)
    const completedTickets = Math.floor(Math.random() * (totalTickets - 5) + 5)
    const completionRate = Math.floor((completedTickets / totalTickets) * 100)

    return {
      date: `2024-03-${String(index + 1).padStart(2, '0')}`,
      totalTickets,
      completedTickets,
      avgResponseTime: Math.floor(Math.random() * 30 + 10),
      avgHandleTime: Math.floor(Math.random() * 120 + 60),
      satisfaction: (Math.random() * 0.5 + 4.5).toFixed(1),
      completionRate,
      serviceType: ['网络服务', '系统维护', '应用部署', '权限申请', '环境配置', '数据备份'][Math.floor(Math.random() * 6)],
      priorityLevel: ['高', '中', '低'][Math.floor(Math.random() * 3)],
      overdueCount: Math.floor(Math.random() * 5),
      firstResolveRate: Math.floor(Math.random() * 20 + 80)
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
    responseTime: Math.floor(Math.random() * 30 + 5),
    resolveTime: Math.floor(Math.random() * 240 + 60),
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

// 模拟 SLA 报表数据
const mockSLAData = {
  overview: {
    totalRate: 95.8,
    trend: 1.2,
    totalTickets: 328,
    achievedTickets: 314,
    eduSystemAvail: 99.95,
    eduSystemDowntime: 35,
    eduSystemIncidents: 2,
    responseRate: 96.5,
    avgResponseTime: 12,
    responseTimeout: 5,
    urgentResponseRate: 98.2,
    resolveRate: 94.8,
    avgResolveTime: 2.5,
    resolveTimeout: 8,
    firstResolveRate: 88.5
  },
  timelineStats: {
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    values: [
      {
        name: '响应时间达标率',
        data: [96.5, 97.2, 95.8, 98.1, 96.9, 97.5, 96.8]
      },
      {
        name: '解决时间达标率',
        data: [94.8, 95.2, 93.9, 96.1, 94.5, 95.8, 94.2]
      },
      {
        name: '系统可用性',
        data: [99.95, 99.98, 99.92, 99.97, 99.96, 99.99, 99.95]
      }
    ]
  },
  tableData: {
    total: 35,
    list: [
      {
        date: '2024-03-07',
        slaType: '紧急故障响应时间SLA',
        target: 95,
        actual: 98.2,
        achievementRate: 103.4
      },
      {
        date: '2024-03-07',
        slaType: '一般故障响应时间SLA',
        target: 90,
        actual: 94.5,
        achievementRate: 105.0
      },
      {
        date: '2024-03-07',
        slaType: '教学系统可用性SLA',
        target: 99.9,
        actual: 99.95,
        achievementRate: 100.05
      },
      {
        date: '2024-03-07',
        slaType: '核心业务系统可用性SLA',
        target: 99.99,
        actual: 99.98,
        achievementRate: 99.99
      },
      {
        date: '2024-03-07',
        slaType: '首次解决率SLA',
        target: 85,
        actual: 88.5,
        achievementRate: 104.1
      }
    ]
  },
  stats: [  // 添加图数据
    { value: 425, name: '已达标' },
    { value: 35, name: '未达标' }
  ],
  cards: [
    {
      title: '响应时间达标率',
      value: '96.5%',
      trend: 1.5,
      color: '#67C23A'
    },
    {
      title: '解决时间达标率',
      value: '94.8%',
      trend: 0.8,
      color: '#409EFF'
    },
    {
      title: '系统可用性',
      value: '99.95%',
      trend: 0.02,
      color: '#67C23A'
    },
    {
      title: '用户满意度',
      value: '96.2%',
      trend: 1.2,
      color: '#67C23A'
    }
  ]
}

// 模拟获取报表数据的方法
export function getReportData(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let responseData = {}
      
      switch (params.reportType) {
        case 'event':
          responseData = {
            stats: [  // 饼图数据
              { value: 25, name: '待处理' },
              { value: 38, name: '处理中' },
              { value: 85, name: '已解决' },
              { value: 15, name: '已关闭' }
            ],
            tableData: {
              total: 50,
              list: Array(50).fill().map((_, index) => ({
                date: `2024-03-${String(index + 1).padStart(2, '0')}`,
                eventId: `EV${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                eventLevel: ['P1-紧急', 'P2-高', 'P3-中', 'P4-低'][Math.floor(Math.random() * 4)],
                status: ['待处理', '处理中', '已解决', '已关闭'][Math.floor(Math.random() * 4)],
                title: ['网络中断', '服务器宕机', '应用故障', '数据库异常', '安全事件'][Math.floor(Math.random() * 5)],
                impactScope: ['全局影响', '部分影响', '局部影响'][Math.floor(Math.random() * 3)],
                responseTime: Math.floor(Math.random() * 30 + 5),
                resolveTime: Math.floor(Math.random() * 240 + 60),
                handler: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)]
              }))
            },
            cards: [
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
            ],
            timelineStats: {
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
          }
          break
        case 'ticket':
          responseData = {
            timelineStats: {
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
            },
            tableData: {
              total: 50,
              list: Array(50).fill().map((_, index) => {
                const totalTickets = Math.floor(Math.random() * 50 + 30)
                const completedTickets = Math.floor(Math.random() * (totalTickets - 5) + 5)
                const completionRate = Math.floor((completedTickets / totalTickets) * 100)

                return {
                  date: `2024-03-${String(index + 1).padStart(2, '0')}`,
                  totalTickets,
                  completedTickets,
                  avgResponseTime: Math.floor(Math.random() * 30 + 10),
                  avgHandleTime: Math.floor(Math.random() * 120 + 60),
                  satisfaction: (Math.random() * 0.5 + 4.5).toFixed(1),
                  completionRate,
                  serviceType: ['网络服务', '系统维护', '应用部署', '权限申请', '环境配置', '数据备份'][Math.floor(Math.random() * 6)]
                }
              })
            },
            cards: [
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
          }
          break
        case 'sla':
          responseData = {
            ...mockSLAData,
            overview: {
              ...mockSLAData.overview,
              totalTickets: 328,
              achievedTickets: 314,
              totalRate: 95.8,
              trend: 1.2,
              eduSystemAvail: 99.95,
              eduSystemDowntime: 35,
              eduSystemIncidents: 2,
              responseRate: 96.5,
              avgResponseTime: 12,
              responseTimeout: 5,
              urgentResponseRate: 98.2,
              resolveRate: 94.8,
              avgResolveTime: 2.5,
              resolveTimeout: 8,
              firstResolveRate: 88.5
            },
            chartData: {
              stats: mockSLAData.stats,
              dates: mockSLAData.timelineStats.dates,
              values: mockSLAData.timelineStats.values
            }
          }
          break
        case 'performance':
          responseData = {
            timelineStats: {
              dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
              values: [
                {
                  name: '工单处理量',
                  data: [32, 28, 35, 29, 33, 26, 30]
                },
                {
                  name: '按时完成率',
                  data: [95.2, 94.8, 95.5, 96.1, 95.8, 95.2, 95.6]
                },
                {
                  name: '满意度',
                  data: [96.5, 95.8, 96.2, 97.1, 96.8, 96.5, 96.9]
                }
              ]
            },
            performanceRanking: [
              { name: '张工', value: 156, onTime: 145, satisfaction: 96 },
              { name: '李工', value: 142, onTime: 132, satisfaction: 94 },
              { name: '王工', value: 138, onTime: 128, satisfaction: 95 },
              { name: '赵工', value: 124, onTime: 115, satisfaction: 93 },
              { name: '刘工', value: 115, onTime: 105, satisfaction: 92 }
            ],
            tableData: mockPerformanceDetails,
            cards: [
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
          }
          break
        // ... 其他报表类型的模拟数据
      }
      
      resolve({
        code: 200,
        data: responseData,
        msg: 'success'
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
      });
    }, 1000);
  });
} 