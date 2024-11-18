import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'
import ticketsRouter from './modules/tickets'

Vue.use(Router)

export const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '仪表盘', icon: 'dashboard', affix: true }
      }
    ]
  },
  ticketsRouter,
  {
    path: '/ops-service',
    component: Layout,
    redirect: '/ops-service/events',
    name: 'OpsService',
    meta: { title: '运维服务', icon: 'el-icon-s-tools' },
    children: [
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/ops-service/events/index'),
        meta: { title: '事件管理', icon: 'el-icon-bell' }
      },
      {
        path: 'events/create',
        name: 'CreateEvent',
        component: () => import('@/views/ops-service/events/create'),
        meta: { title: '新建事件' },
        hidden: true
      },
      {
        path: 'events/detail/:id',
        name: 'EventDetail',
        component: () => import('@/views/ops-service/events/detail'),
        meta: { title: '事件详情' },
        hidden: true
      },
      {
        path: 'tickets',
        name: 'TicketManagement',
        component: () => import('@/views/ops-service/tickets/index'),
        meta: { title: '工单管理', icon: 'el-icon-document' }
      },
      {
        path: 'tickets/create',
        name: 'CreateTicket',
        component: () => import('@/views/ops-service/tickets/create'),
        meta: { title: '新建工单' },
        hidden: true
      },
      {
        path: 'tickets/detail/:id',
        name: 'TicketDetail',
        component: () => import('@/views/ops-service/tickets/detail'),
        meta: { title: '工单详情' },
        hidden: true
      },
      {
        path: 'tickets/assign/:id',
        name: 'AssignTicket',
        component: () => import('@/views/ops-service/tickets/assign'),
        meta: { title: '分派工单' },
        hidden: true
      },
      {
        path: 'reports',
        name: 'OpsReports',
        component: () => import(/* webpackChunkName: "reports" */ '@/views/ops-service/reports/index'),
        meta: { title: '运维统计报表', icon: 'chart' }
      },
      {
        path: 'sla',
        name: 'SLAManagement',
        component: () => import('@/views/ops-service/sla/index'),
        meta: { title: '服务级别管理', icon: 'el-icon-s-flag' }
      },
      {
        path: 'sla/detail/:id',
        name: 'SLADetail',
        component: () => import('@/views/ops-service/sla/detail'),
        meta: { title: 'SLA详情', activeMenu: '/ops-service/sla' },
        hidden: true
      },
      {
        path: 'service-catalog',
        name: 'ServiceCatalog',
        component: () => import('@/views/ops-service/service-catalog/index'),
        meta: { title: '服务目录管理', icon: 'el-icon-menu' }
      },
      {
        path: 'service-catalog/detail/:id',
        name: 'ServiceDetail',
        component: () => import('@/views/ops-service/service-catalog/detail'),
        meta: { title: '服务详情' },
        hidden: true
      },
      {
        path: 'service-catalog/apply/:id',
        name: 'ServiceApply',
        component: () => import('@/views/ops-service/service-catalog/apply'),
        meta: { title: '服务申请' },
        hidden: true
      }
    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    name: 'Knowledge',
    meta: { title: '知识库', icon: 'documentation' },
    children: [
      {
        path: 'organize',
        component: () => import('@/views/knowledge/organize'),
        name: 'KnowledgeOrganize',
        meta: { title: '知识库管理' }
      },
      {
        path: 'collect',
        component: () => import('@/views/knowledge/collect'),
        name: 'KnowledgeCollect',
        meta: { title: '知识采集' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
})

const router = createRouter()

export default router 