import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

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
    redirect: '/ticket-console',
    hidden: true
  },
  {
    path: '/ticket-console',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/ticket-console/index'),
        name: 'TicketConsole',
        meta: { 
          title: '工单控制台', 
          icon: 'ticket-console',
          affix: true
        }
      }
    ]
  },
  {
    path: '/ops-service',
    component: Layout,
    redirect: '/ops-service/events',
    name: 'OpsService',
    meta: { title: '运维服务', icon: 'service' },
    children: [
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/ops-service/events/index'),
        meta: { title: '事件管理', icon: 'event' }
      },
      {
        path: 'events/create',
        name: 'CreateEvent',
        component: () => import('@/views/ops-service/events/create'),
        meta: { title: '新建事' },
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
        meta: { title: '工单管理', icon: 'ticket' }
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
        meta: { title: '服务级别管理', icon: 'sla' }
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
        meta: { title: '服务目录管理', icon: 'catalog' }
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
    meta: { title: '知识库', icon: 'knowledge' },
    children: [
      {
        path: 'search',
        component: () => import('@/views/knowledge/search'),
        name: 'KnowledgeSearch',
        meta: { title: '知识搜索', icon: 'search' }
      },
      {
        path: 'collect-store',
        component: () => import('@/views/knowledge/collect-store'),
        name: 'KnowledgeCollectStore',
        meta: { title: '知识收集与存储', icon: 'knowledge-collect' }
      },
      {
        path: 'category',
        component: () => import('@/views/knowledge/category'),
        name: 'KnowledgeCategory',
        meta: { title: '分类与组织', icon: 'category' }
      },
      {
        path: 'troubleshoot',
        component: () => import('@/views/knowledge/troubleshooting.vue'),
        name: 'TroubleshootGuide',
        meta: { title: '故障排查指南', icon: 'troubleshoot' }
      },
      {
        path: 'sop',
        component: () => import('@/views/knowledge/sop'),
        name: 'SopDocs',
        meta: { title: '标准操作程序(SOP)文档', icon: 'sop' }
      },
      {
        path: 'analysis',
        component: () => import('@/views/knowledge/analysis'),
        name: 'KnowledgeAnalysis',
        meta: { title: '分析与报告' }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    name: 'Device',
    meta: { title: '设备借用', icon: 'device' },
    children: [
      {
        path: 'apply',
        component: () => import('@/views/device/apply'),
        name: 'DeviceApply',
        meta: { title: '创建申请单', icon: 'apply' }
      },
      {
        path: 'process',
        component: () => import('@/views/device/process'),
        name: 'DeviceProcess',
        meta: { title: '进行中的申请', icon: 'process' }
      },
      {
        path: 'record',
        component: () => import('@/views/device/record'),
        name: 'DeviceRecord',
        meta: { title: '申请记录', icon: 'record' }
      },
      {
        path: 'borrowed',
        component: () => import('@/views/device/borrowed'),
        name: 'DeviceBorrowed',
        meta: { title: '领用管理', icon: 'device' }
      },
      {
        path: 'manage',
        component: () => import('@/views/device/manage'),
        name: 'DeviceManage',
        meta: { title: '借用管理', icon: 'device-manage' }
      }
    ]
  },
  {
    path: '/special',
    component: Layout,
    name: 'Special',
    meta: { title: '资产专项管理', icon: 'special' },
    children: [
      {
        path: 'consumable',
        component: () => import('@/views/special/consumable'),
        name: 'ConsumableManagement',
        meta: { title: '耗材管理', icon: 'consumable' }
      },
      {
        path: 'stock',
        component: () => import('@/views/special/stock'),
        name: 'StockManagement',
        meta: { title: '库存管理', icon: 'stock' }
      },
      {
        path: 'contract',
        component: () => import('@/views/special/contract'),
        name: 'ContractManagement',
        meta: { title: '合同管理', icon: 'contract' }
      },
      {
        path: 'supplier',
        component: () => import('@/views/special/supplier'),
        name: 'SupplierManagement',
        meta: { title: '供应商管理', icon: 'supplier' }
      }
    ]
  },
  {
    path: '/asset',
    component: Layout,
    name: 'Asset',
    meta: { title: '资产管理', icon: 'asset' },
    children: [
      {
        path: 'borrow-lib',
        component: () => import('@/views/asset/borrow-lib'),
        name: 'BorrowLib',
        meta: { title: '借用资产库', icon: 'device' }
      },
      {
        path: 'assign-lib',
        component: () => import('@/views/asset/assign-lib'),
        name: 'AssignLib',
        meta: { title: '领用资产库', icon: 'device-manage' }
      },
      {
        path: 'assign-record',
        component: () => import('@/views/asset/assign-record'),
        name: 'AssignRecord',
        meta: { title: '配发记录', icon: 'record' }
      },
      {
        path: 'catalog',
        component: () => import('@/views/asset/catalog'),
        name: 'AssetCatalog',
        meta: { title: '资产目录管理', icon: 'catalog' }
      },
      {
        path: 'category',
        component: () => import('@/views/asset/category'),
        name: 'AssetCategory',
        meta: { title: '资产分类管理', icon: 'category' }
      },
      {
        path: 'register',
        component: () => import('@/views/asset/register'),
        name: 'AssetRegister',
        meta: { title: '资产实物登记与管理', icon: 'apply' }
      },
      {
        path: 'checkin',
        component: () => import('@/views/asset/checkin'),
        name: 'AssetCheckin',
        meta: { title: '资产登记及库', icon: 'apply' }
      },
      {
        path: 'assign',
        component: () => import('@/views/asset/assign'),
        name: 'AssetAssign',
        meta: { title: '资产配发及归还', icon: 'process' }
      },
      {
        path: 'inventory',
        component: () => import('@/views/asset/inventory'),
        name: 'AssetInventory',
        meta: { title: '资产盘点', icon: 'inventory' }
      },
      {
        path: 'delivery',
        component: () => import('@/views/asset/delivery'),
        name: 'AssetDelivery',
        meta: { title: '发运及核收', icon: 'delivery' }
      },
      {
        path: 'storage-in',
        component: () => import('@/views/asset/storage-in'),
        name: 'StorageIn',
        meta: { title: '资产入库', icon: 'storage-in' }
      },
      {
        path: 'storage-out',
        component: () => import('@/views/asset/storage-out'),
        name: 'StorageOut',
        meta: { title: '资产出库', icon: 'storage-out' }
      },
      {
        path: 'repair',
        component: () => import('@/views/asset/repair'),
        name: 'AssetRepair',
        meta: { title: '资产维修', icon: 'repair' }
      },
      {
        path: 'scrap',
        component: () => import('@/views/asset/scrap'),
        name: 'AssetScrap',
        meta: { title: '资产报废', icon: 'scrap' }
      },
      {
        path: 'statistics',
        component: () => import('@/views/asset/statistics'),
        name: 'AssetStatistics',
        meta: { title: '资产查询统计', icon: 'chart' }
      },
      {
        path: 'code',
        component: () => import('@/views/asset/code'),
        name: 'AssetCode',
        meta: { title: '资产编码管理', icon: 'asset-code' }
      },
      {
        path: 'label',
        component: () => import('@/views/asset/label'),
        name: 'LabelPrint',
        meta: { title: '标签打印', icon: 'label' }
      },
      {
        path: 'log',
        component: () => import('@/views/asset/log'),
        name: 'AssetLog',
        meta: { title: '资产管理日志', icon: 'log' }
      }
    ]
  },
    {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: { title: '系统管理', icon: 'system' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user'),
        name: 'UserManagement',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role'),
        name: 'RoleManagement',
        meta: { title: '角色管理', icon: 'role' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu'),
        name: 'MenuManagement',
        meta: { title: '菜单管理', icon: 'menu' }
      },
      {
        path: 'dept',
        component: () => import('@/views/system/dept'),
        name: 'DeptManagement',
        meta: { title: '部门管理', icon: 'dept' }
      },
      {
        path: 'dict',
        component: () => import('@/views/system/dict'),
        name: 'DictManagement',
        meta: { title: '字典管理', icon: 'dict' }
      },
      {
        path: 'config',
        component: () => import('@/views/system/config'),
        name: 'ConfigManagement',
        meta: { title: '参数配置', icon: 'config' }
      },
      {
        path: 'notice',
        component: () => import('@/views/system/notice'),
        name: 'NoticeManagement',
        meta: { title: '通知公告', icon: 'notice' }
      },
      {
        path: 'log',
        component: () => import('@/views/system/log'),
        name: 'LogManagement',
        meta: { title: '日志管理', icon: 'log' }
      }
    ]
  },
  {
    path: '/equipment',
    component: Layout,
    name: 'Equipment',
    meta: { title: '设备借用', icon: 'el-icon-s-tools' },
    children: [
      {
        path: 'apply',
        name: 'EquipmentApply',
        component: () => import('@/views/equipment/apply.vue'),
        meta: { title: '创建申请单' }
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