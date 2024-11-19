import Layout from '@/layout'

const ticketsRouter = {
  path: '/tickets',
  component: Layout,
  redirect: '/tickets/console',
  name: 'Tickets',
  meta: {
    title: '工单服务控制台',
    icon: 'ticket-console'
  },
  children: [
    {
      path: 'create',
      component: () => import('@/views/tickets/create'),
      name: 'CreateTicket',
      meta: { title: '创建工单', icon: 'create-ticket' }
    },
    {
      path: 'all',
      component: () => import('@/views/tickets/all'),
      name: 'AllTickets',
      meta: { title: '所有工单', icon: 'all-tickets' }
    },
    {
      path: 'unassigned',
      component: () => import('@/views/tickets/unassigned'),
      name: 'UnassignedTickets',
      meta: { title: '未分派工单', icon: 'unassigned' }
    }
  ]
}

export default ticketsRouter 