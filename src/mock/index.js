// 模拟数据
export const dashboardData = {
  totalUsers: 1234,
  totalDocs: 5678,
  activeUsers: 890,
  statistics: [
    { date: '2024-01', count: 125 },
    { date: '2024-02', count: 250 },
    { date: '2024-03', count: 375 }
  ]
}

export const knowledgeData = [
  {
    id: 1,
    title: '产品使用手册',
    category: '用户指南',
    createTime: '2024-03-15',
    author: '张三',
    status: '已发布'
  },
  {
    id: 2,
    title: '常见问题解答',
    category: 'FAQ',
    createTime: '2024-03-14',
    author: '李四',
    status: '已发布'
  },
  {
    id: 3,
    title: '系统架构说明',
    category: '技术文档',
    createTime: '2024-03-13',
    author: '王五',
    status: '草稿'
  }
]

// 在已有的 mock 数据中添加新的数据
export const collectData = [
  {
    id: 1,
    source: '邮件导入',
    title: '客户反馈汇总',
    status: '待处理',
    createTime: '2024-03-15 10:30:00'
  },
  {
    id: 2,
    source: '网页抓取',
    title: '产品说明文档',
    status: '已处理',
    createTime: '2024-03-14 15:20:00'
  }
]

export const emailConfig = {
  server: 'smtp.example.com',
  port: 465,
  username: 'system@example.com',
  folders: ['收件箱', '已发送', '垃圾邮件']
}

export const assetData = [
  {
    id: 1,
    name: '产品Logo.png',
    type: 'image',
    size: '1.2MB',
    uploadTime: '2024-03-15',
    url: 'https://example.com/images/logo.png'
  },
  {
    id: 2,
    name: '用户手册.pdf',
    type: 'document',
    size: '2.5MB',
    uploadTime: '2024-03-14',
    url: 'https://example.com/docs/manual.pdf'
  }
] 