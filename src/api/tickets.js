// 模拟工单数据
const mockTickets = [
  {
    id: 'TK2024001',
    title: '无法访问共享打印机',
    type: 'incident',
    priority: 'medium',
    status: 'pending',
    created_at: '2024-03-20 10:30:00',
    handler_name: '张工'
  },
  {
    id: 'TK2024002',
    title: '申请新员工电脑配置',
    type: 'request',
    priority: 'low',
    status: 'processing',
    created_at: '2024-03-20 11:20:00',
    handler_name: '李工'
  },
  {
    id: 'TK2024003',
    title: 'VPN连接异常',
    type: 'incident',
    priority: 'high',
    status: 'unassigned',
    created_at: '2024-03-20 14:15:00',
    handler_name: '-'
  }
]

// 模拟API请求
export function fetchTicketList(query) {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredData = [...mockTickets]
      
      // 模拟搜索
      if (query.search) {
        filteredData = filteredData.filter(item => 
          item.title.includes(query.search) || 
          item.id.includes(query.search)
        )
      }

      // 模拟状态筛选
      if (query.status) {
        filteredData = filteredData.filter(item => item.status === query.status)
      }

      resolve({
        code: 20000,
        data: {
          total: filteredData.length,
          items: filteredData
        }
      })
    }, 300)
  })
}

// 模拟创建工单
export function createTicket(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      const newTicket = {
        id: `TK2024${String(mockTickets.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        handler_name: '-'
      }
      mockTickets.push(newTicket)
      resolve({
        code: 20000,
        data: newTicket
      })
    }, 300)
  })
} 