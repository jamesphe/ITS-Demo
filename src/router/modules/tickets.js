import Layout from '@/layout'

const ticketsRouter = {
  path: '/tickets',
  component: Layout,
  redirect: '/tickets/list',
  name: 'Tickets',
  meta: {
    title: '工单服务控制台',
    icon: 'form'
  },
  children: [
    {
      path: 'create',
      component: () => import('@/views/tickets/create'),
      name: 'CreateTicket',
      meta: { title: '创建工单', icon: 'edit' }
    },
    {
      path: 'list',
      component: () => import('@/views/tickets/list'),
      name: 'TicketList',
      meta: { title: '所有工单', icon: 'list' }
    },
    {
      path: 'unassigned',
      component: () => import('@/views/tickets/list'),
      name: 'UnassignedTickets',
      meta: { 
        title: '未分派工单', 
        icon: 'time',
        query: { status: 'unassigned' }
      }
    },
    {
      path: 'detail/:id',
      component: () => import('@/views/tickets/detail'),
      name: 'TicketDetail',
      meta: { title: '工单详情' },
      hidden: true
    }
  ]
}

export default ticketsRouter 