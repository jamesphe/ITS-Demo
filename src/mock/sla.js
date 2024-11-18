const slaList = [
  {
    id: 1,
    name: '标准服务级别',
    responseTime: 4,
    resolutionTime: 48,
    description: '适用于一般性服务请求',
    status: 'active',
    services: [
      { name: '密码重置', category: '账号服务', priority: '中' },
      { name: '软件安装', category: '桌面支持', priority: '低' }
    ]
  },
  {
    id: 2,
    name: '高优先级服务级别',
    responseTime: 1,
    resolutionTime: 24,
    description: '适用于重要业务系统',
    status: 'active',
    services: [
      { name: '系统故障', category: '系统运维', priority: '高' },
      { name: '网络中断', category: '网络服务', priority: '高' }
    ]
  }
]

export default {
  getSLAList: () => {
    return {
      code: 20000,
      data: {
        total: slaList.length,
        items: slaList
      }
    }
  },
  getSLA: (id) => {
    const sla = slaList.find(item => item.id === parseInt(id))
    return {
      code: 20000,
      data: sla
    }
  }
} 